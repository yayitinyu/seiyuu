import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { createServer } from "node:net";
import { cp, mkdtemp, mkdir, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

async function freePort() {
  const server = createServer();
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("No test port");
  await new Promise<void>((resolve) => server.close(() => resolve()));
  return address.port;
}

test("local studio validates saves, keeps a revision and rejects stale writes", async () => {
  const root = await mkdtemp(join(tmpdir(), "seiyuu-studio-"));
  const sourceRoot = fileURLToPath(new URL("..", import.meta.url));
  let child: ReturnType<typeof spawn> | undefined;
  try {
    for (const path of ["content", "lib", "scripts"]) await mkdir(join(root, path));
    for (const path of [
      "content/archive.json",
      "content/source-audit.json",
      "content/locale-reviews.json",
      "content/journal.ts",
      "lib/i18n.ts",
      "scripts/studio.html",
      "scripts/studio.js",
    ]) await cp(join(sourceRoot, path), join(root, path));
    const port = await freePort();
    const base = `http://127.0.0.1:${port}`;
    child = spawn(process.execPath, ["--experimental-strip-types", join(sourceRoot, "scripts/studio.ts")], {
      cwd: root,
      env: { ...process.env, STUDIO_PORT: String(port) },
      stdio: ["ignore", "pipe", "pipe"],
    });
    const token = await new Promise<string>((resolve, reject) => {
      let output = "";
      const timeout = setTimeout(() => reject(new Error("Studio did not start")), 10000);
      child!.stdout!.on("data", (chunk: Buffer) => {
        output += chunk.toString();
        const match = /#([a-f0-9]{64})/.exec(output);
        if (match) {
          clearTimeout(timeout);
          resolve(match[1]);
        }
      });
      child!.on("error", reject);
      child!.on("exit", (code) => reject(new Error(`Studio exited ${code}: ${output}`)));
    });
    assert.equal((await fetch(`${base}/api/state`)).status, 401);
    const headers = { "X-Studio-Token": token };
    const state = await (await fetch(`${base}/api/state`, { headers })).json();
    const post = (archive: unknown, baseHash: string) => fetch(`${base}/api/archive`, {
      method: "POST",
      headers: { ...headers, Origin: base, "Content-Type": "application/json" },
      body: JSON.stringify({ archive, baseHash }),
    });
    const invalid = structuredClone(state.archive);
    invalid.seiyuu[0].agencyId = "missing-agency";
    assert.equal((await post(invalid, state.archiveHash)).status, 422);
    assert.equal((await post(state.archive, state.archiveHash)).status, 200);
    assert.equal((await post(state.archive, state.archiveHash)).status, 409);
    assert.equal((await readdir(join(root, "content/.revisions"))).length, 1);
    const saved = JSON.parse(await readFile(join(root, "content/archive.json"), "utf8"));
    assert.equal(saved.seiyuu.length, state.archive.seiyuu.length);
  } finally {
    if (child?.exitCode === null) {
      child.kill();
      await once(child, "exit");
    }
    await rm(root, { recursive: true, force: true });
  }
});
