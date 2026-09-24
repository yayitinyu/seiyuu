const token = location.hash.slice(1);
const $ = (id) => document.getElementById(id);
const collections = ["sources", "agencies", "seiyuu", "anime", "characters", "roles", "media"];
let state;

function node(tag, text, className) {
  const element = document.createElement(tag);
  if (text !== undefined) element.textContent = text;
  if (className) element.className = className;
  return element;
}

function notice(message) {
  $("notice").textContent = message;
}

async function api(path, data) {
  const response = await fetch(path, {
    method: data === undefined ? "GET" : "POST",
    headers: {
      "X-Studio-Token": token,
      ...(data === undefined ? {} : { "Content-Type": "application/json" }),
    },
    body: data === undefined ? undefined : JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || `HTTP ${response.status}`);
  return result;
}

function populateEntries() {
  const collection = $("collection").value;
  const entry = $("entry");
  entry.replaceChildren();
  if (collection === "full") {
    entry.disabled = true;
    $("editor").value = JSON.stringify(state.archive, null, 2);
    return;
  }
  entry.disabled = false;
  const add = node("option", "+ 新建条目");
  add.value = "new";
  entry.append(add);
  for (const item of state.archive[collection]) {
    const option = node("option", `${item.id} · ${item.title || item.names?.ja || item.name || item.kind || ""}`);
    option.value = item.id;
    entry.append(option);
  }
  if (entry.options.length > 1) entry.selectedIndex = 1;
  showEntry();
}

function showEntry() {
  const collection = $("collection").value;
  if (collection === "full") return;
  const item = state.archive[collection].find((value) => value.id === $("entry").value);
  $("editor").value = item ? JSON.stringify(item, null, 2) : "{\n  \"id\": \"\"\n}";
}

function reviewer() {
  const name = $("reviewer").value.trim();
  const note = $("review-note").value.trim();
  if (!name || !note) throw new Error("请填写真实审核人及审核说明。");
  return { reviewer: name, note };
}

function render() {
  const overview = $("overview");
  overview.replaceChildren();
  for (const [label, value] of [
    ["人物", state.archive.seiyuu.length],
    ["作品", state.archive.anime.length],
    ["来源", state.archive.sources.length],
    ["获准素材", state.archive.media.length],
  ]) {
    const row = node("div");
    row.append(node("dt", label), node("dd", String(value)));
    overview.append(row);
  }
  const selectedCollection = $("collection").value || "seiyuu";
  $("collection").replaceChildren();
  for (const name of [...collections, "full"]) {
    const option = node("option", name === "full" ? "完整档案" : name);
    option.value = name;
    $("collection").append(option);
  }
  $("collection").value = selectedCollection;
  populateEntries();

  const localeList = $("locale-reviews");
  localeList.replaceChildren();
  for (const locale of ["zh-CN", "ja-JP", "en"]) {
    const row = node("div", undefined, "review-row");
    const heading = node("div");
    heading.append(node("h3", locale), node("p", state.digests[locale].slice(0, 16)));
    const status = node("span", state.localeStatuses[locale], "status");
    const button = node("button", "记录审校");
    button.addEventListener("click", () => run(async () => {
      await api("/api/review/locale", { locale, digest: state.digests[locale], ...reviewer() });
      await load("已记录人工审校。");
    }));
    row.append(heading, status, button);
    localeList.append(row);
  }

  const sourceList = $("source-reviews");
  sourceList.replaceChildren();
  for (const source of state.archive.sources) {
    const row = node("div", undefined, "source-row");
    const main = node("div");
    const link = node("a", source.title);
    link.href = source.public_url || source.source_url;
    link.target = "_blank";
    link.rel = "noreferrer";
    main.append(link);
    const entry = state.audit.sources[source.id];
    const latest = entry?.observations.at(-1);
    const detail = node("details");
    detail.append(node("summary", "版本记录"));
    detail.append(node("p", `取证 URL：${source.source_url}`));
    const versions = node("div", latest
      ? `${entry.observations.length} 版 · 最近检查 ${entry.checkedAt}`
      : "尚未检查");
    detail.append(versions);
    for (const observation of entry?.observations || [])
      detail.append(node("p", `${observation.checkedAt} · HTTP ${observation.status ?? observation.error} · SHA-256 ${observation.sha256 ?? "—"} · ${observation.finalUrl ?? ""}`));
    if (entry?.review) detail.append(node("p", `上次审核 ${entry.review.reviewer} · ${entry.review.reviewedAt} · ${entry.review.note}`));
    main.append(detail);
    const status = node("span", state.sourceStatuses[source.id], "status");
    const actions = node("div", undefined, "source-actions");
    const check = node("button", "检查");
    check.addEventListener("click", () => run(async () => {
      await api("/api/audit", { sourceId: source.id, auditHash: state.auditHash });
      await load(`${source.id} 已检查；请对照官网后记录审核。`);
    }));
    actions.append(check);
    if (latest && latest.sourceUrl === source.source_url && state.sourceStatuses[source.id] !== "current" && state.sourceStatuses[source.id] !== "manual") {
      const manual = !latest.sha256 || latest.status !== 200;
      const review = node("button", manual ? "人工核验" : "记录审核");
      review.addEventListener("click", () => run(async () => {
        await api("/api/review/source", {
          sourceId: source.id,
          method: manual ? "manual" : "digest",
          ...(manual ? {} : { sha256: latest.sha256 }),
          auditHash: state.auditHash,
          ...reviewer(),
        });
        await load(manual
          ? `${source.id} 已记录人工核验；此来源仍无法比对网页版本，30 天后需重新核验。`
          : `${source.id} 已记录人工审核。`);
      }));
      actions.append(review);
    }
    row.append(main, status, actions);
    sourceList.append(row);
  }
}

async function load(message) {
  state = await api("/api/state");
  render();
  notice(message || "");
}

async function run(action) {
  notice("处理中…");
  try {
    await action();
  } catch (error) {
    notice(error instanceof Error ? error.message : String(error));
  }
}

$("collection").addEventListener("change", populateEntries);
$("entry").addEventListener("change", showEntry);
$("save").addEventListener("click", () => run(async () => {
  const collection = $("collection").value;
  const proposed = structuredClone(state.archive);
  const value = JSON.parse($("editor").value);
  if (collection === "full") {
    await api("/api/archive", { baseHash: state.archiveHash, archive: value });
  } else {
    if (!value || typeof value !== "object" || Array.isArray(value))
      throw new Error("条目必须是 JSON 对象。");
    const current = $("entry").value;
    const index = proposed[collection].findIndex((item) => item.id === current);
    if (index < 0) proposed[collection].push(value);
    else proposed[collection][index] = value;
    await api("/api/archive", { baseHash: state.archiveHash, archive: proposed });
  }
  await load("档案已保存。语言审校会在内容变动后自动标为过期。");
}));

if (token) load().catch((error) => notice(error.message));
else notice("请使用终端输出的 Studio 地址打开。");
