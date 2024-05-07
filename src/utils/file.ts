import { resolve } from "node:path";
import { Readable } from "node:stream";
import type { ReadableStream } from "node:stream/web";

import { createWriteStream, ensureDir, writeFile } from "fs-extra";

const outDir = resolve(__dirname, "..", "..", "dist");

export async function downloadFeed(
  fileName: string,
  url: string
): Promise<boolean> {
  await ensureDir(outDir);
  const writeStream = createWriteStream(
    resolve(outDir, `${fileName}.xml`),
    "utf8"
  );

  const { body } = await fetch(url, {
    redirect: "follow",
  });
  const readableNodeStream = Readable.fromWeb(
    body as ReadableStream<Uint8Array>
  );

  return new Promise((resolve, reject) => {
    readableNodeStream
      .pipe(writeStream)
      .on("error", () => {
        reject(false);
      })
      .on("finish", () => {
        resolve(true);
      });
  });
}

export async function writeFeed(
  fileName: string,
  content: string
): Promise<boolean> {
  try {
    await ensureDir(outDir);
    await writeFile(resolve(outDir, `${fileName}.xml`), content, "utf8");
    return true;
  } catch (_) {
    return false;
  }
}
