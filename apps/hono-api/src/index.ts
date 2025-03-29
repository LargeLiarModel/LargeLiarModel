import { Hono } from "hono";
import { serveStatic } from "hono/bun";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.use("/static/*", serveStatic({ root: "./" }));
app.use("/favicon.ico", serveStatic({ path: "./favicon.ico" }));
app.get("/", (c) => c.text("You can access: /static/hello.txt"));
app.get("*", serveStatic({ path: "./static/fallback.txt" }));

export type AppType = typeof app;
export default app;
