import {
  dirname,
  fromFileUrl,
  join,
} from "https://deno.land/std@0.224.0/path/mod.ts";

const ROOT = dirname(dirname(fromFileUrl(import.meta.url)));
const DIST_DIR = join(ROOT, "dist");
const BASE_URL = "http://127.0.0.1:8000";
const SERVER_TIMEOUT_MS = Number(
  Deno.env.get("EXPORT_VERCEL_SERVER_TIMEOUT_MS") ?? "120000",
);
const SERVER_POLL_INTERVAL_MS = 1000;
const LOG_TAIL_LIMIT = 8000;

const PAGE_EXTENSIONS = new Set(["", "/"]);
const pageQueue: string[] = ["/"];
const visitedPages = new Set<string>();
const assetQueue = new Set<string>();

const child = new Deno.Command(Deno.execPath(), {
  args: ["task", "preview"],
  cwd: ROOT,
  stdout: "piped",
  stderr: "piped",
}).spawn();

let previewStatus: Deno.CommandStatus | null = null;
let previewStdoutTail = "";
let previewStderrTail = "";

function appendLogTail(current: string, chunk: string): string {
  const combined = current + chunk;
  if (combined.length <= LOG_TAIL_LIMIT) return combined;
  return combined.slice(-LOG_TAIL_LIMIT);
}

async function captureStream(
  stream: ReadableStream<Uint8Array> | null,
  onChunk: (chunk: string) => void,
): Promise<void> {
  if (!stream) return;

  const reader = stream.getReader();
  const decoder = new TextDecoder();

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      if (value) onChunk(decoder.decode(value, { stream: true }));
    }

    const tail = decoder.decode();
    if (tail) onChunk(tail);
  } finally {
    reader.releaseLock();
  }
}

const stdoutCapture = captureStream(child.stdout, (chunk) => {
  previewStdoutTail = appendLogTail(previewStdoutTail, chunk);
});

const stderrCapture = captureStream(child.stderr, (chunk) => {
  previewStderrTail = appendLogTail(previewStderrTail, chunk);
});

const previewStatusPromise = child.status.then((status) => {
  previewStatus = status;
  return status;
});

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
  const deadline = Date.now() + SERVER_TIMEOUT_MS;

  while (Date.now() < deadline) {
    if (previewStatus) {
      throw new Error(
        `Preview process exited early with code ${previewStatus.code}.`,
      );
    }

    try {
      const response = await fetch(BASE_URL, { redirect: "manual" });
      if (response.ok || response.status === 301 || response.status === 302) {
        return;
      }
    } catch {
      // Server is not ready yet.
    }

    await new Promise((resolve) =>
      setTimeout(resolve, SERVER_POLL_INTERVAL_MS)
    );
  }

  throw new Error(
    `Preview server did not start in time (${SERVER_TIMEOUT_MS}ms).`,
  );
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
} catch (err) {
  const stdoutTail = previewStdoutTail.trim();
  const stderrTail = previewStderrTail.trim();
  const details = [
    err instanceof Error ? err.message : String(err),
    stdoutTail ? `Preview stdout (tail):\n${stdoutTail}` : "",
    stderrTail ? `Preview stderr (tail):\n${stderrTail}` : "",
  ].filter(Boolean).join("\n\n");

  throw new Error(details);
} finally {
  if (!previewStatus) {
    try {
      child.kill("SIGTERM");
    } catch {
      // Preview process may have already exited.
    }
  }

  await Promise.allSettled([
    previewStatusPromise,
    stdoutCapture,
    stderrCapture,
  ]);
}
