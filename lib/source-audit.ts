import { sha256 } from "./editorial.ts";
import type { SourceObservation } from "./editorial.ts";
import type { Source } from "./types.ts";

export async function observeSource(source: Source): Promise<SourceObservation> {
  const checkedAt = new Date().toISOString();
  try {
    const response = await fetch(source.source_url, {
      redirect: "follow",
      signal: AbortSignal.timeout(12000),
      headers: {
        Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.5",
        "User-Agent": "SeiyuuArchiveSourceAudit/1.0 (+https://seiyuu.page)",
      },
    });
    if (new URL(response.url).protocol !== "https:")
      throw new Error("redirected to a non-HTTPS URL");
    const result: SourceObservation = {
      sourceUrl: source.source_url,
      checkedAt,
      status: response.status,
      finalUrl: response.url,
    };
    if (response.status !== 200) {
      await response.body?.cancel();
      return result;
    }
    const chunks: Uint8Array[] = [];
    let size = 0;
    const reader = response.body?.getReader();
    if (!reader) throw new Error("empty response body");
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > 2_000_000) throw new Error("response exceeds 2 MB audit limit");
        chunks.push(value);
      }
    } finally {
      reader.releaseLock();
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    result.sha256 = sha256(bytes);
    result.bytes = size;
    return result;
  } catch (error) {
    return {
      sourceUrl: source.source_url,
      checkedAt,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
