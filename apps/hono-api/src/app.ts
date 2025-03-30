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

import { GoogleGenAI } from "@google/genai";
import { real } from "drizzle-orm/gel-core";

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
  })
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
        and(ne(PAC_Candidate.Type, "24A"), ne(PAC_Candidate.Type, "24N"))
      )
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

const images = new Hono().get(
  "/",
  validator("form", async (value, c) => {
    // const parsed = schema.safeParse(value);
    // if (!parsed.success) {
    //   return c.text("Invalid!", 401);
    // }
    const num = 10;
    const max = 12789;
    const page_num = Math.floor(Math.random() * max);

    const art_res = await fetch(
      `https://api.artic.edu/api/v1/artworks?page=${page_num}&limit=10`
    );
    const art_body = await art_res.json();
    const art_data = art_body.data;
    const imgs = [];

    for (let i = 0; i < 1; i++) {
      const curr_id = art_data[i].image_id;
      const img_res = await fetch(
        `https://www.artic.edu/iiif/2/${curr_id}/full/843,/0/default.jpg`
      );

      console.log(img_res);
      const buff = await img_res.arrayBuffer();
      imgs.push({
        inlineData: { data: arrayBufferToBase64(buff), mimeType: "image/jpeg" },
      });
    }

    const prompt = `## Image Analysis and Description Task for AI Recreation

**Goal:** Analyze each image in the provided list and generate a detailed, structured textual description that another AI model can use to attempt to recreate the image.

**For each image, follow these steps and include the following information in your description:**

**1. Overall Impression/Subject:**
   - Briefly state the main subject or scene depicted in the image.
   - What is the dominant mood or feeling conveyed? (e.g., peaceful, energetic, mysterious)

**2. Composition and Framing:**
   - Describe the overall composition (e.g., close-up, wide shot, landscape, portrait).
   - Note the rule of thirds or any other noticeable compositional elements.
   - Describe the viewpoint (e.g., eye-level, high angle, low angle).

**3. Objects and Elements:**
   - List the key objects and elements present in the image.
   - For each object, describe its:
     - **Type:** (e.g., tree, person, building, cloud, table)
     - **Shape:** (e.g., round, rectangular, curved, jagged)
     - **Size and Proportion:** (relative to other objects and the overall frame)
     - **Position and Orientation:** (e.g., center, left, top-right, facing forward, angled)
     - **Material/Texture (if discernible):** (e.g., smooth, rough, metallic, wooden, fluffy)

**4. Color Palette:**
   - Describe the dominant colors present in the image.
   - Note any significant color contrasts or harmonies.
   - Mention the overall color temperature (e.g., warm, cool).

**5. Lighting:**
   - Describe the light source (e.g., natural sunlight, artificial light, moonlight).
   - Note the direction of the light (e.g., from the left, backlighting, overhead).
   - Describe the quality of the light (e.g., soft, harsh, diffused).
   - Identify any significant shadows and their characteristics.

**6. Style and Details (if applicable):**
   - Note any apparent artistic style (e.g., photorealistic, abstract, cartoonish, painterly).
   - Describe any specific details or textures that contribute to the image's unique character (e.g., patterns, reflections, brushstrokes).

**7. Relationships and Interactions:**
   - If multiple objects or entities are present, describe their spatial relationships and any apparent interactions.

**8. Negative Space:**
   - Briefly describe the areas of empty or less detailed space and how they contribute to the overall image.

**Output Format:**

For each image in the list, provide a description clearly labeled with the image number or identifier. Use clear and concise language. Avoid ambiguity and subjective interpretations where possible. Focus on concrete visual details.`;

    if (!process.env.GEMINI_KEY) {
      return c.text("API key not configured", 500);
    }
    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_KEY });

    const generatedDescription = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [prompt, imgs[0]],
      config: {
        responseModalities: ["TEXT"],
      },
    });

    const generatedDescriptionText =
      generatedDescription?.candidates?.[0]?.content?.parts?.[0]?.text;

    const generatedImage = await genAI.models.generateContent({
      model: "gemini-2.0-flash-exp-image-generation",
      contents: `Generate an image fulfilling the following description: ${generatedDescriptionText}`,
      config: {
        responseModalities: ["TEXT", "IMAGE"],
      },
    });

    const imageBinary =
      generatedImage?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return c.json({
      genImageData: imageBinary,
      realImageData: imgs[0],
    });
  })
);

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

const routes = app.route("/images", images).route("/quotes", quotes);

// Export the app type for RPC client usage
export type AppType = typeof routes;
export default app;
