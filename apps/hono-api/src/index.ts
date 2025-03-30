import { Hono } from "hono";
import { validator } from "hono/validator";
import { cors } from "hono/cors";
import { z } from "zod";

import { db } from "../src/drizzle/client";
import { eq } from "drizzle-orm";
import {
  Candidacies,
  Candidate,
  Committees,
  PAC_Candidate,
  PAC_PAC,
} from "../src/drizzle/schema";

import { GoogleGenAI } from "@google/genai";
import { GoogleGenerativeAI } from "@google/generative-ai";

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

app.get("/", async (c) => {
  // const i = Math.floor(Math.random() * 8290);
  // const cand = await db.select().from(Candidate).where(eq(Candidate.id, i));
  // return c.json(cand);
  return c.text("testing please come later");
});

const schema = z.object({
  body: z.number().gt(0),
});

app.get(
  "/twin/images",
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
    let imgs = [];

    for (let i = 0; i < 1; i++) {
      let curr_id = art_data[i].image_id;
      let img_res = await fetch(
        `https://www.artic.edu/iiif/2/${curr_id}/full/843,/0/default.jpg`
      );

      console.log(img_res);
      let buff = await img_res.arrayBuffer();
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

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const generatedDescription = await model.generateContent([prompt, ...imgs]);

    return c.json(generatedDescription);
  })
);

app.get("/twin/quotes", async (c) => {
  console.log("running");
  // const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: "Explain how AI works",
  });

  return c.json(response);
});

app.get();

export type AppType = typeof app;
export default app;
