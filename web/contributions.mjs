const api = "https://api.github.com";
const author = "Momoyeyu";

async function getJSON(url, fetcher) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetcher(url, {
      signal: controller.signal,
      credentials: "omit",
      cache: "no-store",
      headers: { Accept: "application/vnd.github+json" },
    });
    if (!response.ok) throw new Error(`GitHub: ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

async function mergedPullRequests(projects, fetcher) {
  const query = `is:pr is:merged author:${author} ${projects.map(p => `repo:${p.repo}`).join(" ")}`;
  const items = [];
  for (let page = 1; page <= 10; page++) {
    const params = new URLSearchParams({ q: query, per_page: "100", page: String(page), sort: "created", order: "desc" });
    const data = await getJSON(`${api}/search/issues?${params}`, fetcher);
    // Never replace the complete fallback with a timed-out or truncated search.
    if (data.incomplete_results !== false || !Number.isSafeInteger(data.total_count) ||
        data.total_count < 0 || data.total_count > 1000 || !Array.isArray(data.items))
      throw new Error("Incomplete GitHub search");
    items.push(...data.items);
    if (items.length >= data.total_count) return items;
    if (!data.items.length) throw new Error("Missing GitHub search page");
  }
  throw new Error("GitHub search result limit");
}

export function sortProjects(projects) {
  return [...projects].sort((a, b) => b.stars - a.stars || a.repo.localeCompare(b.repo));
}

export async function refreshContributions(projects, fetcher = fetch) {
  // Metadata and the contribution search are independent; start them together.
  const results = await Promise.allSettled([
    ...projects.map(async project => {
      const data = await getJSON(`${api}/repos/${project.repo}`, fetcher);
      if (!Number.isSafeInteger(data.stargazers_count) || data.stargazers_count < 0)
        throw new Error("Missing GitHub star count");
      return data.stargazers_count;
    }),
    mergedPullRequests(projects, fetcher),
  ]);
  const merged = results.at(-1);
  const updated = projects.map((project, index) => {
    const stars = results[index];
    const next = { ...project, stars: stars.status === "fulfilled" ? stars.value : project.stars };
    if (merged.status === "fulfilled") {
      const prs = new Map();
      for (const item of merged.value) {
        if (item.repository_url?.toLowerCase() !== `${api}/repos/${project.repo}`.toLowerCase() ||
            item.user?.login?.toLowerCase() !== author.toLowerCase() ||
            !item.pull_request?.merged_at || !Number.isFinite(Date.parse(item.pull_request.merged_at)) ||
            !Number.isSafeInteger(item.number) || item.number < project.minimumPR ||
            item.html_url?.toLowerCase() !== `https://github.com/${project.repo}/pull/${item.number}`.toLowerCase()) continue;
        prs.set(item.number, { number: item.number, title: typeof item.title === "string" ? item.title : "" });
      }
      next.prs = [...prs.values()].sort((a, b) => b.number - a.number);
    }
    return next;
  });
  return { projects: sortProjects(updated), complete: results.every(result => result.status === "fulfilled") };
}

export async function enhanceContributions() {
  const list = document.querySelector(".work-list");
  const status = document.querySelector(".work-update");
  const rows = new Map([...list.querySelectorAll("[data-repo]")].map(row => [row.dataset.repo, row]));
  let fallback = [...rows].map(([repo, row]) => ({
    repo, minimumPR: Number(row.dataset.minimumPr), stars: Number(row.dataset.stars),
    prs: [...row.querySelectorAll(".pr-links a")].map(link => ({ number: Number(link.textContent.slice(1)), title: link.title })),
  }));
  let state = "loading";
  let fetchedAt;
  let snapshotDate = "2026-10-24";
  function updateLabels() {
    const zh = document.documentElement.lang.startsWith("zh");
    const locale = zh ? "zh-CN" : "en-US";
    for (const row of rows.values()) {
      const stars = Number(row.dataset.stars);
      row.querySelector(".work-stars").textContent = `☆ ${stars.toLocaleString(locale)}`;
      row.querySelector(".work-stars").setAttribute("aria-label", `${stars.toLocaleString(locale)} GitHub stars`);
      row.querySelector(".pr-links").setAttribute("aria-label", `${row.dataset.repo} · ${zh ? "已合并的 PR" : "merged pull requests"}`);
    }
    const text = zh ? {
      loading: "按 star 数量降序 · 正在从 GitHub 更新",
      live: "按 star 数量降序 · 已从 GitHub 更新",
      fallback: `按 star 数量降序 · 部分实时数据暂不可用，沿用 ${snapshotDate} 记录`,
    } : {
      loading: "Stars, high to low · Updating from GitHub",
      live: "Stars, high to low · Updated from GitHub",
      fallback: `Stars, high to low · Some live data unavailable; using records from ${snapshotDate}`,
    };
    status.textContent = text[state];
    if (state === "live") {
      const time = document.createElement("time");
      time.dateTime = fetchedAt.toISOString();
      time.textContent = ` · ${fetchedAt.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })}`;
      status.append(time);
    }
    status.dataset.state = state;
  }
  function render(projects) {
    // Reuse authored rows so translations, focused links and particle symbols survive reordering.
    const focused = document.activeElement;
    const fragment = document.createDocumentFragment();
    for (const project of projects) {
      const row = rows.get(project.repo);
      row.dataset.stars = String(project.stars);
      const links = row.querySelector(".pr-links");
      const existing = new Map([...links.querySelectorAll("a")].map(link => [Number(link.textContent.slice(1)), link]));
      const next = document.createDocumentFragment();
      for (const pr of project.prs) {
        const link = existing.get(pr.number) || document.createElement("a");
        link.href = `https://github.com/${project.repo}/pull/${pr.number}`;
        link.textContent = `#${pr.number}`;
        link.title = pr.title;
        next.append(link);
      }
      links.replaceChildren(next);
      fragment.append(row);
    }
    list.append(fragment);
    if (focused !== document.body && focused?.isConnected && !focused.closest("[inert]"))
      focused.focus({ preventScroll: true });
    updateLabels();
    document.dispatchEvent(new Event("landable:content-change"));
  }
  // Language changes must update status text without issuing more API requests.
  new MutationObserver(updateLabels).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  updateLabels();
  try {
    // An authenticated daily deployment keeps this fallback fresh even when a
    // visitor's anonymous GitHub quota is exhausted. No token reaches the browser.
    const response = await fetch("./data/contributions.json", { cache: "no-cache", signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw new Error("Snapshot unavailable");
    const data = await response.json();
    if (!Number.isFinite(Date.parse(data.fetchedAt)) || !Array.isArray(data.projects)) throw new Error("Invalid snapshot");
    const updated = fallback.map(project => {
      const saved = data.projects.find(p => p.repo === project.repo);
      if (!saved || !Number.isSafeInteger(saved.stars) || saved.stars < 0 || !Array.isArray(saved.prs)) throw new Error("Invalid project");
      const prs = new Map();
      for (const pr of saved.prs) {
        if (!Number.isSafeInteger(pr.number) || pr.number < project.minimumPR || typeof pr.title !== "string") throw new Error("Invalid PR");
        prs.set(pr.number, { number: pr.number, title: pr.title });
      }
      return { ...project, stars: saved.stars, prs: [...prs.values()].sort((a,b) => b.number-a.number) };
    });
    fallback = sortProjects(updated);
    snapshotDate = new Date(data.fetchedAt).toISOString().slice(0,10);
    render(fallback);
  } catch {
    // Keep the verified HTML list if either offline or an invalid snapshot arrives.
  }
  const result = await refreshContributions(fallback);
  fetchedAt = new Date();
  state = result.complete ? "live" : "fallback";
  render(result.projects);
}
