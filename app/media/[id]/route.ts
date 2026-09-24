import { archive } from "@/lib/content";
import { isLicenseActive } from "@/lib/media";
import { readVerifiedMedia } from "@/lib/media-server";

export const dynamic = "force-dynamic";
type Context = { params: Promise<{ id: string }> };

async function serve(request: Request, context: Context, head = false) {
  const { id } = await context.params;
  const asset = archive.media.find((entry) => entry.id === id);
  if (!asset || !isLicenseActive(asset))
    return new Response(null, { status: 404, headers: { "Cache-Control": "no-store" } });
  try {
    const bytes = await readVerifiedMedia(asset);
    const range = request.headers.get("range");
    let start = 0;
    let end = bytes.length - 1;
    if (range) {
      const match = /^bytes=(\d+)-(\d*)$/.exec(range);
      if (!match)
        return new Response(null, {
          status: 416,
          headers: { "Content-Range": `bytes */${bytes.length}`, "Cache-Control": "no-store" },
        });
      start = Number(match[1]);
      end = match[2] ? Number(match[2]) : end;
      if (start > end || end >= bytes.length)
        return new Response(null, {
          status: 416,
          headers: { "Content-Range": `bytes */${bytes.length}`, "Cache-Control": "no-store" },
        });
    }
    const partial = !!range;
    const headers = new Headers({
      "Content-Type": asset.mimeType,
      "Content-Length": String(end - start + 1),
      "Accept-Ranges": "bytes",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "Cross-Origin-Resource-Policy": "same-origin",
    });
    if (partial) headers.set("Content-Range", `bytes ${start}-${end}/${bytes.length}`);
    return new Response(head ? null : new Uint8Array(bytes.subarray(start, end + 1)), {
      status: partial ? 206 : 200,
      headers,
    });
  } catch (error) {
    console.error("Media delivery failed", asset.id, error);
    return new Response(null, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}

export async function GET(request: Request, context: Context) {
  return serve(request, context);
}

export async function HEAD(request: Request, context: Context) {
  return serve(request, context, true);
}
