import { hc } from "hono/client";
import type { AppType } from "@largeliarmodel/hono-api/src/index";

// Handle client side and server side conditions
const base = typeof window === 'undefined'
    ? 'http://localhost:3000'
    : '/';

const client = hc<AppType>(base);

export default client;