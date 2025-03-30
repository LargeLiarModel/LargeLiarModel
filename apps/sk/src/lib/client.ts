// Use absolute imports to avoid path resolution issues
import { hcWithType } from "../../../hono-api/src/client";
import type { AppType } from "../../../hono-api/src/app";
import { hc } from "hono/client";

// Handle client side and server side conditions
const base = 
    process.env.NODE_ENV === "development" && typeof window === "undefined"
        ? "http://localhost:3000" // Local development server-side
        : "/api"; // Use /api path for both client and server in production

// Create the client with pre-computed types
const client = hcWithType(base);

// Helper function to check if the client is working
export const checkApiConnection = async () => {
    try {
        const response = await client.quotes.$get();
        return { success: true, data: response };
    } catch (error) {
        console.error("API connection error:", error);
        return { success: false, error };
    }
};

export default client;
