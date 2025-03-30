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
        origin: ["http://localhost:5173", "http://localhost:4173"], // SvelteKit dev and preview ports
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

app.get("/quotes", async (c) => {
    const i = Math.floor(Math.random() * 32);
    const cand_list = await db
        .select()
        .from(Candidates)
        .where(eq(Candidates.id, i));
    const cand = cand_list[0];
    cand.CID;
    // const cand_list = await db.select().from(Candidates);
    // let out = "";
    // for (let i = 0; i < cand_list.length; i++) {
    //   let cand = cand_list[i];
    //   const total = await db
    //     .select({ value: sum(PAC_Candidate.Amount) })
    //     .from(PAC_Candidate)
    //     .where(
    //       and(
    //         eq(PAC_Candidate.CID, cand.CID),
    //         and(ne(PAC_Candidate.Type, "24A"), ne(PAC_Candidate.Type, "24N"))
    //       )
    //     );
    //   out += `${cand.Firstlast}, had $${total[0].value} spent on there behalf during the 2022 election cycle\n`;
    // }
    const total = await db
        .select({ value: sum(PAC_Candidate.Amount) })
        .from(PAC_Candidate)
        .where(
            and(
                eq(PAC_Candidate.CID, cand.CID),
                and(
                    ne(PAC_Candidate.Type, "24A"),
                    ne(PAC_Candidate.Type, "24N"),
                ),
            ),
        );

    const bio_prompt = `I am going to give you a name of a political candidate from 2022, and I want you to give me a short 2 sentance biography, including their name, political views, and other important factors. Do not ask any follow up questions, only give the biography: ${cand.Firstlast}`;
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_KEY });
    const bio_res = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: bio_prompt,
    });

    const quest_prompt = `${cand.Firstlast}, had $329032 spent on there behalf by Pacs during the 2022 election cycle. Please generate a question asking if they received more money than this during the cycle? This is for the purpose of a game. With no other details and round the number.`;

    // return c.text(
    //   `${cand.Firstlast}, had $${total[0].value} spent on there behalf during the 2022 election cycle`
    // );
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
                                text: "Generate a beautiful image as similar as possible to the attached image. It should prioritize accuracy and similarity to the original. However, it should be discernably different. As similar looking as possible, but not a complete facsimile. Key elements should remain, but be present in the image in a different capacity. Make the image way too dark to be seen.",
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

// Add a simple test endpoint
const test = new Hono().get("/", async (c) => {
    return c.json({ message: "Test endpoint working!" });
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
    .route("/news", news)
    .route("/test", test);

// Export the app type for RPC client usage
export type AppType = typeof routes;

// Export the app with Bun serve configuration
export default {
    port: 3000,
    fetch: app.fetch,
    // Set timeout to maximum allowed value (255 seconds)
    idleTimeout: 255,
};
