import {
  clamp,
  between,
  damp,
  createTimeline,
  frameAt,
  particlePosition,
  ambientParticle,
} from "./story-motion.mjs";

const INKS = ["#c8d5ed", "#b9acee", "#9edbc7"];
const mix = (a, b, t) => a + (b - a) * t;
const seedFor = (i) => {
  let x = (i + 0x9e3779b9) | 0;
  x = Math.imul(x ^ (x >>> 16), 0x21f0aaad);
  x = Math.imul(x ^ (x >>> 15), 0x735a2d97);
  return ((x ^ (x >>> 15)) >>> 0) / 4294967296;
};
const sceneIds = ["main", "approach", "journey", "contributions", "start"];
const captions = {
  en: [
    "Discover",
    "Look closer",
    "Make a contribution",
    "Landed work",
    "Your starting point",
  ],
  zh: ["发现落点", "看见机会", "贡献之旅", "已合并的贡献", "从你开始"],
};

function spread(points, limit) {
  if (!points.length)
    return [{ x: innerWidth / 2, y: innerHeight / 2, alpha: 0 }];
  // A stable spatial order makes the handover coherent rather than random spaghetti.
  const sorted = points.sort((a, b) => {
    const ax = Math.floor(a.x / 32),
      bx = Math.floor(b.x / 32);
    return ax - bx || (ax % 2 ? b.y - a.y : a.y - b.y);
  });
  if (sorted.length <= limit) return sorted;
  return Array.from(
    { length: limit },
    (_, i) => sorted[Math.floor((i * sorted.length) / limit)],
  );
}

function svgPoints(svg, origin) {
  const points = [];
  const opacityCache = new Map();
  function opacity(node) {
    if (opacityCache.has(node)) return opacityCache.get(node);
    const style = getComputedStyle(node);
    const own = Number(style.opacity);
    const result =
      own *
      (node.parentElement instanceof SVGElement
        ? opacity(node.parentElement)
        : 1);
    opacityCache.set(node, result);
    return result;
  }
  for (const node of svg.querySelectorAll(
    "path,circle,ellipse,line,polyline,rect",
  )) {
    if (typeof node.getTotalLength !== "function" || node.closest("defs"))
      continue;
    const style = getComputedStyle(node);
    const alpha = opacity(node);
    if (alpha < 0.015 || style.display === "none") continue;
    const matrix = node.getScreenCTM();
    if (!matrix) continue;
    const stroke = style.stroke !== "none";
    if (!stroke && (style.fill === "none" || style.fill.startsWith("url(")))
      continue;
    const box = node.getBBox();
    if (!stroke && box.width > 12) continue;
    const toPoint = (x, y, a) => {
      const point = new DOMPoint(x, y).matrixTransform(matrix);
      points.push({
        x: point.x - origin.left,
        y: point.y - origin.top,
        alpha: clamp(a, 0.14, 1),
      });
    };
    if (!stroke || (node.tagName === "circle" && box.width < 7)) {
      toPoint(box.x + box.width / 2, box.y + box.height / 2, alpha);
      continue;
    }
    const length = node.getTotalLength();
    const scale = Math.hypot(matrix.a, matrix.b);
    const count = Math.max(2, Math.ceil((length * scale) / 3));
    for (let i = 0; i < count; i++) {
      const point = node.getPointAtLength((length * i) / count);
      toPoint(point.x, point.y, alpha * Number(style.strokeOpacity));
    }
  }
  return points;
}

function textPoints(elements, origin, width, height) {
  const plate = document.createElement("canvas");
  plate.width = width;
  plate.height = height;
  const context = plate.getContext("2d", { willReadFrequently: true });
  if (!context) return [];
  context.fillStyle = "white";
  context.textBaseline = "alphabetic";
  for (const element of elements) {
    const style = getComputedStyle(element);
    context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      for (let i = 0; i < node.textContent.length; i++) {
        const character = node.textContent[i];
        if (/\s/.test(character)) continue;
        const range = document.createRange();
        range.setStart(node, i);
        range.setEnd(node, i + 1);
        const rect = range.getBoundingClientRect();
        if (!rect.width || !rect.height) continue;
        const metric = context.measureText(character);
        const ascent =
          metric.fontBoundingBoxAscent ?? parseFloat(style.fontSize) * 0.8;
        const descent =
          metric.fontBoundingBoxDescent ?? parseFloat(style.fontSize) * 0.2;
        context.fillText(
          character,
          rect.left - origin.left,
          rect.top - origin.top + (rect.height - ascent - descent) / 2 + ascent,
        );
      }
    }
  }
  const data = context.getImageData(0, 0, width, height).data;
  const points = [];
  for (let y = 0; y < height; y += 2)
    for (let x = 0; x < width; x += 2) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha > 90) points.push({ x, y, alpha: alpha / 255 });
    }
  return points;
}

function outlinePoints(element, origin) {
  if (!element) return [];
  const rect = element.getBoundingClientRect();
  const x = rect.left - origin.left,
    y = rect.top - origin.top,
    points = [];
  for (let dx = 0; dx < rect.width; dx += 4) {
    points.push(
      { x: x + dx, y, alpha: 0.55 },
      { x: x + dx, y: y + rect.height, alpha: 0.55 },
    );
  }
  for (let dy = 0; dy < rect.height; dy += 4) {
    points.push(
      { x, y: y + dy, alpha: 0.55 },
      { x: x + rect.width, y: y + dy, alpha: 0.55 },
    );
  }
  return points;
}

export function createStory() {
  const main = document.querySelector("main");
  const sections = [
    main.querySelector(".hero"),
    ...sceneIds.slice(1).map((id) => document.getElementById(id)),
  ];
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", { alpha: true });
  if (!context) return;
  canvas.className = "story-particles";
  canvas.setAttribute("aria-hidden", "true");
  const runway = document.createElement("div");
  runway.className = "story-runway";
  const stage = document.createElement("div");
  stage.className = "story-stage";
  const sky = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  sky.classList.add("story-sky");
  sky.setAttribute("aria-hidden", "true");
  sky.setAttribute("viewBox", "0 0 1000 1000");
  sky.setAttribute("preserveAspectRatio", "none");
  for (let i = 0; i < 92; i++) {
    const star = document.createElementNS(sky.namespaceURI, "circle");
    star.setAttribute("cx", String(seedFor(i * 3) * 1000));
    star.setAttribute("cy", String(seedFor(i * 3 + 1) * 1000));
    star.setAttribute("r", String(0.35 + seedFor(i * 3 + 2) * 0.65));
    star.setAttribute("opacity", String(0.1 + seedFor(i + 900) * 0.3));
    sky.append(star);
  }
  const keepsake = document.createElement("div");
  keepsake.className = "particle-keepsake";
  keepsake.setAttribute("aria-hidden", "true");
  keepsake.innerHTML = `<svg viewBox="0 0 194 104" fill="none"><ellipse cx="98" cy="52" rx="82" ry="31" transform="rotate(-18 98 52)" stroke="currentColor" stroke-opacity=".2"/><path d="M17 77C53 80 45 18 76 35S112 82 135 57 153 22 176 28" stroke="currentColor" stroke-opacity=".5"/><path d="m76 35 19 23 40-1" stroke="#9edbc7" stroke-opacity=".4"/><circle cx="17" cy="77" r="3" stroke="#9edbc7"/><circle cx="76" cy="35" r="4" stroke="currentColor"/><circle cx="95" cy="58" r="2" fill="#9edbc7"/><circle cx="135" cy="57" r="4" stroke="#9edbc7"/><circle cx="176" cy="28" r="3" stroke="currentColor"/></svg>`;
  sections[1].querySelector(".section-intro").append(keepsake);
  const panels = sections.map((section, index) => {
    const panel = document.createElement("div");
    panel.className = "story-panel";
    panel.dataset.scene = String(index);
    const content = document.createElement("div");
    content.className = "story-content";
    content.append(section);
    panel.append(content);
    return panel;
  });
  panels[0].firstElementChild.append(main.querySelector(".horizon"));
  const navigation = document.createElement("nav");
  navigation.className = "story-navigation";
  const chapterButtons = sections.map((_, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "chapter-button";
    button.dataset.chapter = String(index);
    button.innerHTML = `<span class="chapter-mark" aria-hidden="true"></span><span class="chapter-caption"></span>`;
    button.addEventListener("click", () => jump(index, true));
    navigation.append(button);
    return button;
  });
  stage.append(sky, ...panels, canvas, navigation);
  runway.append(stage);
  main.replaceChildren(runway);
  const contents = panels.map((panel) => panel.firstElementChild);
  const preference = matchMedia("(prefers-reduced-motion: reduce)");
  const connection = navigator.connection;
  let enabled = false,
    failed = false,
    timeline,
    clouds = [];
  let height = innerHeight,
    width = innerWidth,
    runwayTop = 0;
  let current = 0,
    target = 0,
    frame = 0,
    lastTime = 0,
    active = -1;
  let rebuildFrame = 0,
    rebuildTimer = 0,
    paintCount = 0;
  let lastState = null,
    lastAmbientTime = 0,
    ambientFrames = 0;
  let stageVisible = true;

  function updateLabels() {
    const language = document.documentElement.lang.startsWith("zh")
      ? "zh"
      : "en";
    navigation.setAttribute(
      "aria-label",
      language === "zh" ? "章节导航" : "Chapter navigation",
    );
    chapterButtons.forEach((button, index) => {
      button.querySelector(".chapter-caption").textContent =
        captions[language][index];
      button.setAttribute(
        "aria-label",
        `${language === "zh" ? "前往" : "Go to"} ${captions[language][index]}`,
      );
    });
  }
  function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
    lastTime = 0;
  }
  function setActive(index) {
    if (active === index) return;
    active = index;
    panels.forEach((panel, i) => {
      panel.inert = i !== index;
      panel.setAttribute("aria-hidden", String(i !== index));
    });
    chapterButtons.forEach((button, i) => {
      if (i === index) button.setAttribute("aria-current", "step");
      else button.removeAttribute("aria-current");
    });
  }
  function drawParticles(state, time = performance.now()) {
    const progress = state.morph;
    context.clearRect(0, 0, width, height);
    const count = width <= 600 ? 1500 : 3000;
    const source = clouds[state.from],
      destination = clouds[state.to];
    if (!source?.length || !destination?.length) return;
    const envelope =
      between(0, 0.13, progress) * (1 - between(0.86, 1, progress));
    const sourceHold = 1 - between(0, 0.14, progress),
      targetHold = between(0.86, 1, progress);
    let drawn = 0;
    for (let i = 0; i < count; i++) {
      const a = source[Math.floor((i * source.length) / count)];
      const b = destination[Math.floor((i * destination.length) / count)];
      const seed = seedFor(i),
        glint = ambientParticle(seed, time);
      const sourceRest = a.rest && seed > 0.5 ? 1 : 0,
        targetRest = b.rest && seed > 0.5 ? 1 : 0;
      const from = { x: a.x, y: a.y - state.offset };
      const position = particlePosition(from, b, progress, seed);
      const swell = Math.sin(Math.PI * position.travel);
      const alpha = clamp(
        envelope *
          Math.max(0.3, mix(a.alpha, b.alpha, position.travel)) *
          (0.65 + swell * 0.3) +
          sourceHold * sourceRest * glint.alpha * a.alpha * 0.82 +
          targetHold * targetRest * glint.alpha * b.alpha * 0.82,
      );
      if (alpha < 0.015) continue;
      const living = mix(sourceRest, targetRest, position.travel);
      position.x += glint.x * living;
      position.y += glint.y * living;
      if (
        position.x < -15 ||
        position.x > width + 15 ||
        position.y < -15 ||
        position.y > height + 15
      )
        continue;
      const size = mix(0.85 + seed * 0.5, 1.5, swell) + (seed > 0.97 ? 0.6 : 0);
      context.globalAlpha = alpha;
      context.fillStyle = INKS[i % INKS.length];
      context.fillRect(
        position.x - size / 2,
        position.y - size / 2,
        size,
        size,
      );
      drawn++;
      if (seed > 0.97) {
        context.globalAlpha *= 0.17;
        context.fillRect(position.x - 4, position.y - 0.3, 8, 0.6);
        context.fillRect(position.x - 0.3, position.y - 4, 0.6, 8);
      }
    }
    context.globalAlpha = 1;
    canvas.dataset.particles = String(
      progress > 0 && progress < 1 ? count : drawn,
    );
    canvas.dataset.activity =
      progress > 0 && progress < 1 ? "morph" : "ambient";
    canvas.dataset.frames = String(++ambientFrames);
  }
  function hasAmbient() {
    return lastState && (lastState.morph === 0 || lastState.morph === 1);
  }
  function wake() {
    if (!frame && enabled && stageVisible && !document.hidden && hasAmbient()) {
      lastTime = performance.now();
      frame = requestAnimationFrame(tick);
    }
  }
  function paint(time = performance.now()) {
    if (!enabled || !timeline) return;
    const state = frameAt(current, timeline);
    const p = state.morph;
    const same = state.from === state.to;
    setActive(state.active);
    const outgoing = 1 - between(0.015, 0.25, p),
      incoming = between(0.75, 0.985, p);
    panels.forEach((panel, index) => {
      const isFrom = index === state.from,
        isTo = index === state.to;
      const opacity = isFrom ? (same ? 1 : outgoing) : isTo ? incoming : 0;
      panel.style.opacity = String(opacity);
      panel.style.visibility = opacity > 0.001 ? "visible" : "hidden";
      const offset = isFrom ? state.offset : 0;
      contents[index].style.transform = `translate3d(0,${-offset}px,0)`;
    });
    lastState = state;
    drawParticles(state, time);
    stage.dataset.from = String(state.from);
    stage.dataset.to = String(state.to);
    stage.dataset.raw = state.raw.toFixed(4);
    stage.dataset.morph = p.toFixed(4);
    stage.dataset.phase = p > 0 && p < 1 ? "morph" : "rest";
    stage.dataset.paints = String(++paintCount);
  }
  function tick(time) {
    frame = 0;
    if (!enabled || document.hidden || !stageVisible) return;
    const delta = Math.min(0.064, Math.max(0, (time - lastTime) / 1000));
    lastTime = time;
    if (current !== target) {
      current = damp(current, target, delta);
      if (Math.abs(current - target) < 0.3) current = target;
      paint(time);
      lastAmbientTime = time;
    } else if (hasAmbient() && time - lastAmbientTime >= 1000 / 28) {
      drawParticles(lastState, time);
      lastAmbientTime = time;
    }
    if (current === target && stage.dataset.settled !== "true")
      stage.dataset.settled = "true";
    if (current !== target || hasAmbient()) frame = requestAnimationFrame(tick);
    else lastTime = 0;
  }
  function request(immediate = false) {
    if (!enabled || document.hidden || !stageVisible) return;
    target = clamp(scrollY - runwayTop, 0, timeline.total);
    if (immediate || Math.abs(target - current) > height * 2) {
      stop();
      current = target;
      paint();
      stage.dataset.settled = "true";
      wake();
      return;
    }
    if (Math.abs(target - current) < 0.3) {
      if (current !== target) {
        current = target;
        paint();
      }
      wake();
      return;
    }
    stage.dataset.settled = "false";
    if (!frame) {
      lastTime = performance.now();
      frame = requestAnimationFrame(tick);
    }
  }
  function collectClouds() {
    const origin = stage.getBoundingClientRect();
    const svgSelectors = [
      ".star-chart",
      ".evidence-list svg,.particle-keepsake svg",
      ".artifact-top svg",
      "",
      ".start-orbit svg",
    ];
    const textSelectors = [
      "",
      "#approach-title",
      "#journey-title,.detail-title,.artifact-title",
      "#contributions-title",
      "#start-title,.install-command code",
    ];
    return panels.map((panel, index) => {
      const vector = [];
      if (svgSelectors[index])
        for (const svg of panel.querySelectorAll(svgSelectors[index]))
          vector.push(...svgPoints(svg, origin));
      if (index === 2) {
        vector.push(...outlinePoints(panel.querySelector(".artifact"), origin));
        for (const dot of panel.querySelectorAll(".stage-dot")) {
          const box = dot.getBoundingClientRect();
          for (let i = 0; i < 16; i++) {
            const angle = (i * Math.PI) / 8;
            vector.push({
              x:
                box.left -
                origin.left +
                box.width / 2 +
                (Math.cos(angle) * box.width) / 2,
              y:
                box.top -
                origin.top +
                box.height / 2 +
                (Math.sin(angle) * box.height) / 2,
              alpha: 0.8,
            });
          }
        }
      }
      if (index === 3) {
        vector.push(
          ...textPoints(
            [...panel.querySelectorAll(".work-symbol")],
            origin,
            width,
            Math.ceil(contents[index].getBoundingClientRect().height),
          ),
        );
        for (const symbol of panel.querySelectorAll(".work-symbol")) {
          const rect = symbol.getBoundingClientRect();
          for (let i = 0; i < 40; i++) {
            const angle = (i * Math.PI) / 20;
            vector.push({
              x:
                rect.left -
                origin.left +
                rect.width / 2 +
                (Math.cos(angle) * rect.width) / 2,
              y:
                rect.top -
                origin.top +
                rect.height / 2 +
                (Math.sin(angle) * rect.height) / 2,
              alpha: 0.65,
            });
          }
        }
      }
      vector.forEach((point) => (point.rest = true));
      let text = [];
      if (textSelectors[index])
        text = textPoints(
          [...panel.querySelectorAll(textSelectors[index])],
          origin,
          width,
          Math.ceil(contents[index].getBoundingClientRect().height),
        );
      return spread(
        [...spread(vector, 1800), ...(text.length ? spread(text, 2400) : [])],
        3600,
      );
    });
  }
  function build(preserve = true) {
    if (!enabled) return;
    stop();
    const oldPosition = scrollY - runwayTop;
    const previous =
      timeline && preserve
        ? frameAt(clamp(scrollY - runwayTop, 0, timeline.total), timeline)
        : null;
    const oldTimeline = timeline;
    width = innerWidth;
    height = innerHeight;
    document.documentElement.style.setProperty("--story-height", `${height}px`);
    contents.forEach((content) => (content.style.transform = "none"));
    const ranges = contents.map((content) =>
      Math.max(0, content.getBoundingClientRect().height - height),
    );
    timeline = createTimeline(ranges, height);
    runway.style.height = `${timeline.total + height}px`;
    runwayTop = runway.getBoundingClientRect().top + scrollY;
    panels.forEach((panel, i) => {
      panel.dataset.start = String(timeline.scenes[i].start);
      panel.dataset.read = String(ranges[i]);
      panel.dataset.transitionStart = String(
        timeline.scenes[i].transitionStart,
      );
    });
    const ratio = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    clouds = collectClouds();
    updateLabels();
    if (previous) {
      const next = timeline.scenes[previous.from];
      target =
        previous.from !== previous.to
          ? next.transitionStart + previous.raw * timeline.distance
          : next.start +
            (oldTimeline.scenes[previous.from].read
              ? (previous.offset / oldTimeline.scenes[previous.from].read) *
                next.read
              : 0);
      const oldScene = oldTimeline.scenes[previous.from];
      if (
        previous.from === panels.length - 1 &&
        oldPosition > oldScene.transitionStart
      ) {
        // Preserve the final resting distance and the footer when copy/layout changes.
        target = next.transitionStart + oldPosition - oldScene.transitionStart;
      }
      window.scrollTo({ top: runwayTop + target, behavior: "instant" });
    } else target = clamp(scrollY - runwayTop, 0, timeline.total);
    current = target;
    paint();
    stage.dataset.settled = "true";
    stage.dataset.ready = "true";
    wake();
  }
  function scheduleBuild() {
    if (!enabled) return;
    clearTimeout(rebuildTimer);
    rebuildTimer = setTimeout(() => {
      cancelAnimationFrame(rebuildFrame);
      rebuildFrame = requestAnimationFrame(() => {
        rebuildFrame = 0;
        try {
          build();
        } catch (error) {
          fallback(error);
        }
      });
    }, 80);
  }
  function indexForTarget(element) {
    if (element === main) return 0;
    return panels.findIndex((panel) => panel.contains(element));
  }
  function jump(index, focus = false, hash = true) {
    if (!enabled || !timeline) return;
    stop();
    target = timeline.scenes[index].start;
    current = target;
    window.scrollTo({ top: runwayTop + target, behavior: "instant" });
    paint();
    stage.dataset.settled = "true";
    wake();
    if (hash) {
      const suffix = index ? `#${sceneIds[index]}` : "";
      if (location.hash !== suffix)
        history.pushState(
          null,
          "",
          `${location.pathname}${location.search}${suffix}`,
        );
    }
    if (focus) (index ? sections[index] : main).focus({ preventScroll: true });
  }
  function hashTarget(hash) {
    try {
      return document.getElementById(decodeURIComponent(hash.slice(1)));
    } catch {
      return null;
    }
  }
  function syncHash() {
    if (!enabled) return;
    const targetElement = location.hash ? hashTarget(location.hash) : main;
    const index = targetElement ? indexForTarget(targetElement) : -1;
    if (index >= 0) jump(index, false, false);
  }
  function setMode() {
    const next =
      !failed &&
      !preference.matches &&
      !connection?.saveData &&
      innerHeight >= 560;
    if (next === enabled) return;
    enabled = next;
    document.documentElement.classList.toggle("story-mode", enabled);
    if (enabled) {
      try {
        build(false);
        if (location.hash) syncHash();
      } catch (error) {
        fallback(error);
      }
    } else {
      stop();
      clearTimeout(rebuildTimer);
      cancelAnimationFrame(rebuildFrame);
      const index = Math.max(0, active);
      active = -1;
      panels.forEach((panel) => {
        panel.inert = false;
        panel.removeAttribute("aria-hidden");
        panel.removeAttribute("style");
      });
      contents.forEach((content) => content.removeAttribute("style"));
      runway.removeAttribute("style");
      canvas.width = canvas.height = 0;
      if (timeline)
        requestAnimationFrame(() =>
          sections[index].scrollIntoView({
            behavior: "instant",
            block: "start",
          }),
        );
    }
  }
  function fallback(error) {
    failed = true;
    stage.dataset.ready = "fallback";
    setMode();
    console.warn(
      "Scroll story unavailable; the complete reading layout is active.",
      error,
    );
  }
  document.addEventListener(
    "click",
    (event) => {
      if (
        !enabled ||
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const link = event.target.closest("a");
      if (
        !link ||
        link.origin !== location.origin ||
        link.pathname !== location.pathname ||
        link.target === "_blank"
      )
        return;
      const destination = link.hash
        ? hashTarget(link.hash)
        : link.getAttribute("href") === "#"
          ? main
          : null;
      if (!destination) return;
      const index = indexForTarget(destination);
      if (index < 0) return;
      event.preventDefault();
      jump(index, false);
      destination.focus({ preventScroll: true });
    },
    true,
  );
  addEventListener("scroll", () => request(), { passive: true });
  addEventListener("resize", () => {
    const same = enabled;
    setMode();
    if (same && enabled && (innerWidth !== width || innerHeight !== height))
      scheduleBuild();
  });
  addEventListener("hashchange", syncHash);
  addEventListener("popstate", syncHash);
  preference.addEventListener("change", setMode);
  connection?.addEventListener("change", setMode);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else request(true);
  });
  document.addEventListener("landable:content-change", scheduleBuild);
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(([entry]) => {
      stageVisible = entry.isIntersecting;
      if (!stageVisible) stop();
      else request(true);
    });
    observer.observe(stage);
  }
  document.fonts.ready.then(scheduleBuild);
  document.fonts.addEventListener("loadingdone", scheduleBuild);
  updateLabels();
  setMode();
  return { refresh: scheduleBuild };
}
