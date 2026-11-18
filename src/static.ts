import { readFile } from "node:fs/promises";
import type { ServerResponse } from "node:http";

const FILES: Record<string, { file: string; type: string }> = {
  "/": { file: "index.html", type: "text/html; charset=utf-8" },
  "/app.js": { file: "app.js", type: "text/javascript; charset=utf-8" },
  "/shop-view.js": { file: "shop-view.js", type: "text/javascript; charset=utf-8" },
  "/cart-session.js": { file: "cart-session.js", type: "text/javascript; charset=utf-8" },
  "/style.css": { file: "style.css", type: "text/css; charset=utf-8" },
};

const PUBLIC_DIR = new URL("../public/", import.meta.url);

export async function serveStatic(pathname: string, res: ServerResponse): Promise<boolean> {
  const entry = FILES[pathname];
  if (!entry) return false;
  try {
    const body = await readFile(new URL(entry.file, PUBLIC_DIR));
    res.writeHead(200, { "content-type": entry.type });
    res.end(body);
    return true;
  } catch {
    return false;
  }
}
