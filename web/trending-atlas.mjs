export function trendingWaves(data) {
  const seen = new Set();
  const repos = [];
  for (const repo of Array.isArray(data?.repositories) ? data.repositories : []) {
    if (typeof repo.name !== "string" || !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo.name) ||
        repo.name.split("/").some(part => part === "." || part === "..") || seen.has(repo.name.toLowerCase()) ||
        (repo.stars !== null && (!Number.isSafeInteger(repo.stars) || repo.stars < 0))) continue;
    seen.add(repo.name.toLowerCase());
    repos.push({ name: repo.name, stars: repo.stars, lang: String(repo.lang || ""), desc: String(repo.desc || "") });
    if (repos.length === 20) break;
  }
  return Array.from({ length: Math.ceil(repos.length / 4) }, (_, i) => repos.slice(i * 4, i * 4 + 4));
}

export function waveAt(index, count) {
  return count ? ((index % count) + count) % count : 0;
}

export function canRotate(state) {
  return state.visible && state.atRest && !state.hidden && !state.reduced &&
    !state.saveData && !state.interacting && !state.paused;
}

export async function enhanceAtlas() {
  const atlas = document.querySelector(".atlas");
  const slots = [...atlas.querySelectorAll("[data-trending-slot]")];
  const routes = ["tools", "ai", "systems", "other"];
  const counter = atlas.querySelector(".atlas-counter");
  const pause = atlas.querySelector(".atlas-pause");
  const previous = atlas.querySelector(".atlas-previous");
  const next = atlas.querySelector(".atlas-next");
  const source = atlas.querySelector(".atlas-source");
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const connection = navigator.connection;
  let waves = trendingWaves({ repositories: slots.map(slot => ({
    name: slot.dataset.repo, stars: Number(slot.dataset.stars), lang: slot.dataset.language, desc: slot.dataset.description,
  })) });
  let wave = 0, selected = 0, timer = 0, swap = 0;
  let paused = false, hovering = false, visible = true, manualSwap = false;
  let fetchedAt = atlas.dataset.fetchedAt;

  function state() {
    const stage = document.querySelector(".story-stage");
    const story = document.documentElement.classList.contains("story-mode");
    return { visible, hidden: document.hidden, reduced: motion.matches, saveData: Boolean(connection?.saveData),
      interacting: hovering || atlas.contains(document.activeElement), paused,
      atRest: !story || Boolean(stage && stage.dataset.from === "0" && stage.dataset.phase === "rest" && Number(stage.dataset.raw) <= 0.2 && stage.dataset.settled === "true"),
    };
  }
  function select(index) {
    selected = index;
    const repo = waves[wave]?.[selected];
    if (!repo) return;
    atlas.dataset.route = routes[selected];
    slots.forEach((slot, i) => slot.setAttribute("aria-pressed", String(i === selected)));
    atlas.querySelector(".observation-repo").textContent = repo.name.replace("/", " / ");
    atlas.querySelector(".observation-link").href = `https://github.com/${repo.name}`;
    atlas.querySelector(".observation-title").textContent = repo.name.split("/")[1];
    atlas.querySelector(".observation-detail").textContent = repo.desc || repo.lang;
    atlas.querySelector(".observation-detail").title = repo.desc;
  }
  function render() {
    const zh = document.documentElement.lang.startsWith("zh");
    slots.forEach((slot, i) => {
      const repo = waves[wave]?.[i];
      slot.hidden = !repo;
      if (!repo) return;
      slot.querySelector(".star-name strong").textContent = repo.name.split("/")[1];
      slot.querySelector(".star-name > span").textContent = [repo.lang, repo.stars === null ? "" : `☆ ${repo.stars.toLocaleString("en-US")}`].filter(Boolean).join(" · ");
      slot.title = repo.name;
      slot.setAttribute("aria-label", `${zh ? "查看" : "Explore"} ${repo.name}`);
    });
    counter.textContent = `${String(wave + 1).padStart(2,"0")} / ${String(waves.length).padStart(2,"0")}`;
    counter.setAttribute("aria-label", zh ? `第 ${wave+1} 组，共 ${waves.length} 组` : `Group ${wave+1} of ${waves.length}`);
    const date = Number.isFinite(Date.parse(fetchedAt)) ? new Date(fetchedAt).toISOString().slice(0,10) : "";
    source.textContent = `GitHub Trending · ${zh ? "日榜" : "Daily"}${date ? ` · ${date}` : ""}`;
    source.title = zh ? "近期热榜，仅供探索；并非个性化推荐或贡献机会评估。" : "Trending projects to explore, not personal recommendations or assessed contribution openings.";
    pause.textContent = paused ? "▶" : "Ⅱ";
    pause.setAttribute("aria-label", zh ? (paused ? "播放项目轮播" : "暂停项目轮播") : (paused ? "Play project rotation" : "Pause project rotation"));
    pause.setAttribute("aria-pressed", String(paused));
    previous.setAttribute("aria-label", zh ? "上一组项目" : "Previous projects");
    next.setAttribute("aria-label", zh ? "下一组项目" : "Next projects");
    previous.disabled = next.disabled = pause.disabled = waves.length <= 1;
    select(Math.min(selected, (waves[wave]?.length || 1) - 1));
  }
  function reconcile() {
    clearTimeout(timer); timer = 0;
    if (!canRotate(state())) {
      // A layout rebuild or the clicked control taking focus may pause autoplay;
      // neither should swallow an explicit previous/next action already in flight.
      if (!manualSwap) {
        clearTimeout(swap); swap = 0;
        atlas.classList.remove("is-wave-changing");
      }
      return;
    }
    if (waves.length > 1 && !swap) timer = setTimeout(() => change(1, false), 9000);
  }
  function change(direction, manual = true) {
    clearTimeout(timer); timer = 0;
    clearTimeout(swap); swap = 0;
    if (!waves.length || (!manual && !canRotate(state()))) return;
    manualSwap = manual;
    const commit = () => {
      swap = 0;
      manualSwap = false;
      if (!manual && !canRotate(state())) { atlas.classList.remove("is-wave-changing"); reconcile(); return; }
      wave = waveAt(wave + direction, waves.length);
      selected = 0;
      render();
      atlas.classList.remove("is-wave-changing");
      reconcile();
    };
    if (motion.matches) commit();
    else { atlas.classList.add("is-wave-changing"); swap = setTimeout(commit, 320); }
  }
  slots.forEach((slot,i) => {
    slot.disabled = false;
    slot.addEventListener("click", () => { select(i); reconcile(); });
  });
  previous.addEventListener("click", () => change(-1));
  next.addEventListener("click", () => change(1));
  pause.addEventListener("click", () => { paused = !paused; render(); reconcile(); });
  atlas.addEventListener("pointerenter", () => { hovering = true; reconcile(); });
  atlas.addEventListener("pointerleave", () => { hovering = false; reconcile(); });
  atlas.addEventListener("focusin", reconcile);
  atlas.addEventListener("focusout", () => queueMicrotask(reconcile));
  document.addEventListener("visibilitychange", reconcile);
  motion.addEventListener("change", reconcile);
  connection?.addEventListener("change", reconcile);
  addEventListener("scroll", reconcile, { passive: true });
  new MutationObserver(() => { render(); reconcile(); }).observe(document.documentElement, { attributes:true, attributeFilter:["lang","class"] });
  const stage = document.querySelector(".story-stage");
  if (stage) new MutationObserver(reconcile).observe(stage, { attributes:true, attributeFilter:["data-from","data-raw","data-settled"] });
  if ("IntersectionObserver" in window) new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; reconcile(); }, { threshold: 0.25 }).observe(atlas);
  render();
  reconcile();
  try {
    const response = await fetch("./data/trending.json", { cache:"no-cache", signal:AbortSignal.timeout(8000) });
    if (!response.ok) return;
    const data = await response.json();
    const updated = trendingWaves(data);
    if (!updated.length) return;
    waves = updated; wave = selected = 0; fetchedAt = data.fetchedAt;
    render(); reconcile();
    document.dispatchEvent(new Event("landable:content-change"));
  } catch {
    // The first verified group is authored in HTML; a failed refresh never empties it.
  }
}
