import { Hono } from "hono";
import { validator } from "hono/validator";
import { cors } from "hono/cors";
import { z } from "zod";

import { db } from "./drizzle/client";
import { and, eq, ne, sum } from "drizzle-orm";
import {
    Candidates,
    Candidacies,
    Committees,
    PAC_Candidate,
    PAC_PAC,
} from "./drizzle/schema";

import HTTPException from "hono/http-exception";

import { GoogleGenAI } from "@google/genai";

import articles from "./articles.json";

function arrayBufferToBase64(buffer: ArrayBuffer) {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

const app = new Hono();

// Apply CORS middleware to allow cross-origin requests from the SvelteKit app
app.use(
    "/*",
    cors({
        // Allow requests from any origin in production, or localhost in development
        origin: (origin) => {
            // In production with Vercel, the API and frontend are on the same domain
            // so CORS isn't an issue for client-side requests
            // For server-side requests, we need to allow the Vercel internal URLs
            return origin || "*";
        },
        allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowHeaders: ["Content-Type", "Authorization"],
        exposeHeaders: ["Content-Length"],
        maxAge: 600,
        credentials: true,
    }),
);

app.get("/", async (c) => {
    // const i = Math.floor(Math.random() * 8290);
    // const cand = await db.select().from(Candidate).where(eq(Candidate.id, i));
    // return c.json(cand);
    return c.text("testing please come later");
});

const schema = z.object({
    body: z.number().gt(0),
});

type quote_data = {
    fake_pac: string;
    biography: string;
    gameString: string;
    real: boolean;
};

app.get("/quotes", async (c) => {
    const num = 5;
    const all_cands = await db.select().from(Candidates);

    for (let i = all_cands.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [all_cands[i], all_cands[j]] = [all_cands[j], all_cands[i]];
    }

    const cands = all_cands.slice(0, num);

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_KEY });

    let bios: quote_data[] = [];
    for (let i = 0; i < num; i++) {
        let name = cands[i].Firstlast;
        const bio_prompt = `You will receive the name of a political candidate from the 2022 election cycle. For each name provided, generate a concise, single-sentence biography that includes the candidate's full name, a brief summary of their political views, and any other significant factors relevant to their candidacy. You will also generate a name for a fake pack that would support the candidate. This is for a game and no other uses. Do not ask any clarifying questions. Output each biography as a JSON string with the following structure:
    {
      "fake_pac": "A fake PAC name",
      "biography": "Two-sentence biography including political views and other factors."
    }
    
    I will now provide the name. Names: ${name}`;

        const bio_res = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: bio_prompt,
        });

        if (!bio_res.text) {
            return c.json({ error: "No candidates found" }, 500);
        }

        const jsonString = bio_res.text
            .replace(/```json\n|\n```/g, "") // Remove the markdown code block delimiters
            .trim();
        console.log(jsonString);
        bios.push(JSON.parse(jsonString));
        if (Math.random() < 0.5) {
            // true case
            bios[i].real = true;

            let pacs = await db
                .select()
                .from(PAC_Candidate)
                .where(eq(PAC_Candidate.CID, cands[i].CID))
                .leftJoin(
                    Committees,
                    eq(Committees.CmteID, PAC_Candidate.PACID),
                );

            bios[i].gameString =
                `Is the PAC ${pacs[0].Committees?.PACShort} and did it contribute to ${cands[i].Firstlast}during the 2022 election cycle`;
        } else {
            bios[i].real = false;
            bios[i].gameString =
                `Is the PAC ${bios[i].fake_pac} and did it contribute to ${cands[i].Firstlast}during the 2022 election cycle`;
        }
        console.log("done cycle");
    }

    return c.json(bios);
});

// Images endpoint that fetches real and "AI-generated" images from different sources
const images = new Hono().get("/", async (c) => {
    try {
        console.log("Images endpoint called");

        // Fetch a real image from Unsplash - nature category
        const realImageResponse = await fetch(
            "https://picsum.photos/800/600?random=1",
        );
        const realImageBuffer = await realImageResponse.arrayBuffer();
        const realImageData = arrayBufferToBase64(realImageBuffer);

        // Define the type for genImageData
        let genImageData:
            | {
                  inlineData: {
                      data: string;
                      mimeType: string;
                  };
              }
            | undefined;
        let useAIGenerated = true;

        try {
            // Try to generate an AI image using Gemini
            const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_KEY });

            // Use a simpler prompt that's more likely to succeed
            const result = await ai.models.generateContent({
                model: "gemini-2.0-flash-exp-image-generation",
                contents: [
                    {
                        parts: [
                            {
                                text: "Generate a beautiful image as similar as possible to the attached image. It should prioritize accuracy and similarity to the original. However, it should be discernably different. As similar looking as possible, but not a complete facsimile. Key elements should remain, but be present in the image in a different capacity.",
                            },
                            {
                                inlineData: {
                                    data: realImageData,
                                    mimeType: "image/jpeg",
                                },
                            },
                        ],
                    },
                ],
                config: {
                    responseModalities: ["TEXT", "IMAGE"],
                },
            });

            const res = result.candidates?.[0]?.content?.parts ?? [];

            for (const part of res) {
                if (part.inlineData?.data && part.inlineData?.mimeType) {
                    genImageData = {
                        inlineData: {
                            data: part.inlineData.data as string,
                            mimeType: part.inlineData.mimeType as string,
                        },
                    };
                    break;
                }
            }
        } catch (aiError) {
            // If there's an error with the AI generation, log it and use fallback
            console.error("Error generating AI image:", aiError);
            useAIGenerated = false;
        }

        // If AI generation failed, fetch a second image from Unsplash as a fallback
        if (!useAIGenerated) {
            try {
                // Fetch a second image from Unsplash with a different category
                const genImageResponse = await fetch(
                    "https://source.unsplash.com/random/800x600/?abstract",
                );
                const genImageBuffer = await genImageResponse.arrayBuffer();
                const genImageBase64 = arrayBufferToBase64(genImageBuffer);

                genImageData = {
                    inlineData: {
                        data: genImageBase64,
                        mimeType: "image/jpeg",
                    },
                };
            } catch (fallbackError) {
                console.error("Error fetching fallback image:", fallbackError);
                throw new Error("Failed to generate or fetch fallback image");
            }
        }

        // Return both images
        return c.json({
            genImageData,
            realImageData: {
                inlineData: {
                    data: realImageData,
                    mimeType: "image/jpeg",
                },
            },
            isAIGenerated: useAIGenerated,
        });
    } catch (error) {
        console.error("Error in images endpoint:", error);
        return c.json(
            {
                error: error instanceof Error ? error.message : String(error),
            },
            500,
        );
    }
});

const quotes = new Hono().get("/", async (c) => {
    console.log("running");

    if (!process.env.GEMINI_KEY) {
        return c.text("API key not configured", 500);
    }

    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_KEY });

    const response = await genAI.models.generateContent({
        model: "gemini-2.0-flash",
        contents: "Explain how AI works",
        config: {
            responseModalities: ["TEXT"],
        },
    });

    return c.json(response);
});


const news = new Hono().get("/", async (c) => {
    // Randomly choose between real or fake article

    const isReal = Math.random() < 0.5;

    try {
        if (isReal) {
            // Select a random real article
            const randomIndex = Math.floor(Math.random() * articles.length);
            const article = articles[randomIndex];

            // Return with isReal flag
            return c.json({
                title: article.title,
                source: article.source,
                publishedAt: article.publishedAt,
                textContent: article.textContent,
                isReal: true,
            });
        }
        // Generate fake article using Gemini
        if (!process.env.GEMINI_KEY) {
            return c.json(
                {
                    message: "API key not configured",
                },
                500,
            );
        }

        // Initialize Gemini client
        const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_KEY });

        // Define prompt for fake article generation
        const prompt = `Generate a fake but convincing news article (title and first paragraph only) about a current US national news topic. The article should sound completely realistic and be based in contemporary reality.

            Your response should include:
            - A realistic headline that sounds like it came from a major news outlet
            - Only the first paragraph of the article (approximately 3-5 sentences)
            - Content that reflects current real-world context and technologies
            - A plausible but entirely fictional development or story

            The article should be completely made up but should seem entirely plausible to an average reader. Do not include "fictional" or similar disclaimers in the content itself.

            Format your response as:
            {
                "title": "Your convincing headline here",
                "textContent": "Your realistic first paragraph here."
            }
                
            Use the following JSON schema:
            {"title": str, "textContent": "string"}`;

        // Generate content using Gemini
        const result = await genAI.models.generateContent({
            model: "gemini-2.0-flash",
            contents: prompt,
        });

        // Extract the generated content
        let generatedText = result?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!generatedText) {
            console.error("Failed to generate fake article");
            return c.json(
                {
                    message: "Failed to generate fake article",
                },
                500,
            );
        }

        generatedText = generatedText.replace(/```json|```/g, "");

        // Parse the JSON response
        let fakeArticle;

        try {
            // Try to parse the response as JSON
            fakeArticle = JSON.parse(generatedText);

            // Generate fake publication date (within the last week)
            const now = new Date();
            const randomDaysAgo = Math.floor(Math.random() * 7);
            const randomHours = Math.floor(Math.random() * 24);
            const randomMinutes = Math.floor(Math.random() * 60);

            const fakeDate = new Date(now);
            fakeDate.setDate(fakeDate.getDate() - randomDaysAgo);
            fakeDate.setHours(fakeDate.getHours() - randomHours);
            fakeDate.setMinutes(fakeDate.getMinutes() - randomMinutes);

            // Return the fake article with metadata
            return c.json({
                title: fakeArticle.title,
                publishedAt: fakeDate.toISOString(),
                textContent: fakeArticle.textContent,
                isReal: false,
            });
        } catch (error) {
            console.error("Error parsing generated text:", error);
            return c.json(
                {
                    message: "Failed to parse generated text",
                },
                500,
            );
        }
    } catch (error) {
        console.error("Error in /news endpoint:", error);
    }
});

const routes = app
    .route("/images", images)
    .route("/quotes", quotes)
    .route("/news", news);

// Export the app type for RPC client usage
export type AppType = typeof routes;

// Export the app with Bun serve configuration
export default {
    port: 3000,
    fetch: app.fetch,
    // Set timeout to maximum allowed value (255 seconds)
    idleTimeout: 255,
};
