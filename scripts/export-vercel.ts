import {
  dirname,
  fromFileUrl,
  join,
} from "https://deno.land/std@0.224.0/path/mod.ts";

const ROOT = dirname(dirname(fromFileUrl(import.meta.url)));
const DIST_DIR = join(ROOT, "dist");
const BASE_URL = "http://127.0.0.1:8000";

const PAGE_EXTENSIONS = new Set(["", "/"]);
const pageQueue: string[] = ["/"];
const visitedPages = new Set<string>();
const assetQueue = new Set<string>();

const child = new Deno.Command(Deno.execPath(), {
  args: ["task", "preview"],
  cwd: ROOT,
  stdout: "null",
  stderr: "null",
}).spawn();

function decodeLiveImageURL(rawUrl: string): string {
  const normalized = rawUrl.replaceAll("&amp;", "&");

  try {
    const parsed = new URL(normalized, BASE_URL);
    if (parsed.pathname !== "/live/invoke/website/loaders/image.ts") {
      return rawUrl;
    }

    const src = parsed.searchParams.get("src");
    return src ?? rawUrl;
  } catch {
    return rawUrl;
  }
}

function sanitizeHtml(html: string): string {
  let output = html;

  // Remove Fresh dev client script if present.
  output = output.replace(
    /<script[^>]*src="\/_frsh\/fresh_dev_client\.js"[^>]*><\/script>/g,
    "",
  );

  // Replace Deco image loader URLs by their original image URL.
  output = output.replace(
    /\/live\/invoke\/website\/loaders\/image\.ts\?[^"'\s)]+/g,
    (match) => decodeLiveImageURL(match),
  );

  return output;
}

function pagePathToFile(pathname: string): string {
  if (pathname === "/") return join(DIST_DIR, "index.html");
  const normalized = pathname.replace(/\/$/, "");
  return join(DIST_DIR, normalized, "index.html");
}

function assetPathToFile(pathname: string): string {
  return join(DIST_DIR, pathname.replace(/^\//, ""));
}

function isLikelyPage(pathname: string): boolean {
  if (pathname.startsWith("/_frsh/")) return false;
  if (pathname.startsWith("/live/")) return false;
  if (pathname.startsWith("/_live/")) return false;
  if (pathname.startsWith("/deco/")) return false;
  if (pathname.startsWith("/api/")) return false;

  const lastSegment = pathname.split("/").pop() ?? "";
  const ext = lastSegment.includes(".")
    ? `.${lastSegment.split(".").pop()}`
    : "";

  return PAGE_EXTENSIONS.has(ext);
}

function collectLinksAndAssets(html: string, currentPath: string): void {
  const attrRegex = /(?:href|src)=['"]([^'"#]+)['"]/g;
  const srcsetRegex = /srcset=['"]([^'"]+)['"]/g;

  for (const regex of [attrRegex, srcsetRegex]) {
    let match: RegExpExecArray | null;
    while ((match = regex.exec(html)) !== null) {
      const raw = match[1];

      if (regex === srcsetRegex) {
        for (
          const candidate of raw.split(",").map((part) =>
            part.trim().split(" ")[0]
          )
        ) {
          try {
            const parsed = new URL(
              candidate.replaceAll("&amp;", "&"),
              `${BASE_URL}${currentPath}`,
            );
            if (parsed.origin === new URL(BASE_URL).origin) {
              assetQueue.add(parsed.pathname);
            }
          } catch {
            // Ignore malformed srcset entries.
          }
        }
        continue;
      }

      try {
        const parsed = new URL(raw, `${BASE_URL}${currentPath}`);
        if (parsed.origin !== new URL(BASE_URL).origin) continue;

        if (isLikelyPage(parsed.pathname)) {
          const cleanPath = parsed.pathname.replace(/\/$/, "") || "/";
          if (!visitedPages.has(cleanPath) && !pageQueue.includes(cleanPath)) {
            pageQueue.push(cleanPath);
          }
        } else {
          assetQueue.add(parsed.pathname);
        }
      } catch {
        // Ignore malformed links.
      }
    }
  }
}

async function waitForServer(): Promise<void> {
  for (let attempt = 0; attempt < 40; attempt++) {
    try {
      const response = await fetch(BASE_URL, { redirect: "manual" });
      if (response.ok || response.status === 301 || response.status === 302) {
        return;
      }
    } catch {
      // Server is not ready yet.
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error("Preview server did not start in time.");
}

async function exportPages(): Promise<void> {
  while (pageQueue.length > 0) {
    const pathname = pageQueue.shift();
    if (!pathname || visitedPages.has(pathname)) continue;

    visitedPages.add(pathname);

    const response = await fetch(`${BASE_URL}${pathname}`);
    if (!response.ok) {
      console.warn(`Skipping non-page ${pathname}: ${response.status}`);
      continue;
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html")) {
      console.warn(`Skipping non-HTML ${pathname}: ${contentType}`);
      continue;
    }

    const html = await response.text();
    const sanitized = sanitizeHtml(html);

    collectLinksAndAssets(sanitized, pathname);

    const outFile = pagePathToFile(pathname);
    await Deno.mkdir(dirname(outFile), { recursive: true });
    await Deno.writeTextFile(outFile, sanitized);
  }
}

async function exportAssets(): Promise<void> {
  for (const pathname of assetQueue) {
    if (pathname.startsWith("/live/")) continue;

    const response = await fetch(`${BASE_URL}${pathname}`);
    if (!response.ok) continue;

    const bytes = new Uint8Array(await response.arrayBuffer());
    const outFile = assetPathToFile(pathname);

    await Deno.mkdir(dirname(outFile), { recursive: true });
    await Deno.writeFile(outFile, bytes);
  }
}

async function copyDir(source: string, target: string): Promise<void> {
  await Deno.mkdir(target, { recursive: true });

  for await (const entry of Deno.readDir(source)) {
    const srcPath = join(source, entry.name);
    const dstPath = join(target, entry.name);

    if (entry.isDirectory) {
      await copyDir(srcPath, dstPath);
      continue;
    }

    if (entry.isFile) {
      await Deno.copyFile(srcPath, dstPath);
    }
  }
}

try {
  await Deno.remove(DIST_DIR, { recursive: true });
} catch {
  // dist/ may not exist.
}

await Deno.mkdir(DIST_DIR, { recursive: true });

try {
  await waitForServer();
  await exportPages();
  await exportAssets();
  await copyDir(join(ROOT, "static"), DIST_DIR);

  console.log(
    `Export completed. Pages: ${visitedPages.size}, Assets: ${assetQueue.size}`,
  );
} finally {
  child.kill("SIGTERM");
  await child.status;
}
