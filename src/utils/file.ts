import { resolve } from "path";

import { createWriteStream, ensureDir, writeFile } from "fs-extra";
import { Readable } from "stream";
import { ReadableStream } from "stream/web";

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

  const { body } = await fetch(url);
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
