/* Static content stays useful before enhancement; no framework or runtime dependency. */
const root = document.documentElement;
const translatedNodes = [...document.querySelectorAll("[data-i18n]")];
const english = Object.fromEntries(
  translatedNodes.map((node) => [node.dataset.i18n, node.innerHTML]),
);
const chinese = {
  skip: "跳到正文",
  menu: "菜单",
  navApproach: "如何寻找",
  navJourney: "贡献之旅",
  navWork: "已合并的贡献",
  heroTitle: "在开源世界，<br>找到你的落点。",
  heroDescription:
    "从你的兴趣出发，发现值得早期加入的开源项目。确认真实的参与机会，再把一个契合的 issue 做成经得起审阅的 PR。",
  definition: "Landable 是一个陪你完成开源贡献的 Agent Skill。",
  heroCta: "找到我的起点",
  heroSecondary: "看看这段旅程",
  heroNote: "兴趣决定方向。<br>下一步，由你来选。",
  chartCoordinates: "近期热榜中的可能",
  chartYou: "你的兴趣",
  chartFit: "发现值得探索的项目",
  toolsTag: "开发者工具",
  aiTag: "AI 与模型训练",
  systemsTag: "系统与基础设施",
  observationTitle: "一个小修复，一个好落点。",
  observationDetail: "追踪并修复 Unix socket 的替换竞态。",
  atlasCaption: "近期热榜，仅供探索；真正的契合，还需要你来判断。",
  horizon: "少一点漫游，多一点归属。",
  approachContext: "先找到值得加入的项目",
  approachTitle: "好的补丁，<br>也需要合适的落点。",
  approachBody:
    "一个登上 Trending 的项目，未必适合你参与。Landable 会在你投入时间之前，看看热度之外的事。",
  evidence1Title: "这里欢迎新的贡献者吗？",
  evidence1Body:
    "看看谁的 PR 真正被合并，维护者如何回应。贡献指南是起点，近期的协作记录才是证据。",
  evidence2Title: "这里有适合你的参与机会吗？",
  evidence2Body:
    "让技术栈、工作范围和硬件资源与你能完成的事相匹配。检查已有认领，也追踪依赖中的真正原因。",
  evidence3Title: "这份工作符合项目的需要吗？",
  evidence3Body:
    "先读项目规范、测试要求与审查习惯。架构调整先提议再实施，已经被认领的工作留给原来的贡献者。",
  journeyContext: "从一点好奇，到一份贡献",
  journeyTitle: "路径清晰，<br>也为你的判断留白。",
  journeyBody:
    "六个阶段，每一步都有可检查的产物，也有属于你的选择。收到你的回答之后，才进入下一步。",
  stage0: "了解你",
  stage1: "发现项目",
  stage2: "评估机会",
  stage3: "动手实现",
  stage4: "提交贡献",
  stage5: "持续跟进",
  artifactLabel: "你会拿到",
  choiceLabel: "下一步，由你来选",
  journeyPromise: "你选定 issue，才开始实现；你审阅补丁，才会推送。",
  workContext: "小小的改动，真实的项目",
  workTitle: "贡献落地，<br>是这样的。",
  workBody:
    "这些贡献通过 Landable 发现，每个链接都指向已合并的 PR。这是过去的实践，不是对接纳结果的承诺。",
  workSoupType: "大模型微调",
  workSoupBody:
    "从 MPS 覆盖、答案评分到损失缩放与中文文档。根据可用硬件确定范围，用真实行为验证修复。",
  workKvType: "GPU 基础设施",
  workKvBody:
    "旧监听器退出时，可能误删替代者正在使用的 socket。删除前检查身份，并覆盖这场竞态。",
  workArchifyType: "图解 Agent Skill",
  workArchifyBody:
    "让端点报错给出可执行的线索，改进修复建议，再用可复现的基准衡量质量、速度与成本。",
  workUniType: "多模态强化学习",
  workUniBody:
    "确认无用后移除旧辅助函数；对齐 rollout 的对数概率，保留训练侧的损失缩放。",
  workSource: "在 GitHub 阅读这些贡献的来龙去脉",
  startTitle: "下一份贡献，<br>从你开始。",
  startBody:
    "安装 skill，告诉 agent 你关心什么。<br>找一个值得投入时间的地方。",
  installLabel: "把 Landable 加入你的 agent",
  requirements:
    "准备一个能加载 SKILL.md 的 agent、Node.js，以及已登录的 GitHub CLI。",
  promptLabel: "然后，像这样聊起",
  prompt:
    "“我对 AI 基础设施和 Python 感兴趣。帮我找一些一万星以下、能做出有用贡献的项目。”",
  readSkill: "阅读完整 skill",
  footerTagline: "找到一个项目，做点有用的事，成为其中的一员。",
};

const stages = {
  en: [
    {
      title: "Start with what<br>you care about.",
      body: "Map your domains, languages, and preferred layer of the stack. Check the hardware and compute you can actually use. Interests are yours to set, every time.",
      artifact: "Your interest & capability cards",
      items: [
        "Domains, languages, and preferred layer",
        "Hardware and compute you have available",
        "A profile for this request, never assumed",
      ],
      choice: "Which interests and resources should guide the search?",
    },
    {
      title: "Find a project<br>while it’s still growing.",
      body: "Explore daily and weekly GitHub Trending, usually below 10k stars. Rank candidates by your interests, with promising projects just outside the range kept in view.",
      artifact: "A shortlist worth looking into",
      items: [
        "Candidates within your chosen star range",
        "Why each project fits your interests",
        "A watch list just beyond the range",
      ],
      choice: "Which repositories deserve a closer look?",
    },
    {
      title: "Look for evidence,<br>not just an invitation.",
      body: "Inspect acceptance history, issue responses, existing claims, and where the fix actually belongs. Then judge whether you can finish it with the resources you have.",
      artifact: "An issue menu, with evidence",
      items: [
        "Who gets merged, and who gets a reply",
        "Available issues and realistic scope",
        "Confidence, constraints, and unknowns",
      ],
      choice: "Which issues are worth pursuing?",
    },
    {
      title: "Make the change.<br>Keep the proof.",
      body: "Claim a feasible issue, follow the repository’s own rules, and build a local patch with regression coverage. Prepare the PR text and report what was actually tested.",
      artifact: "Local patches ready for your review",
      items: [
        "A branch, diff, and draft PR description",
        "Tests actually run, with their results",
        "Known limitations and anything unverified",
      ],
      choice: "Approve, adjust, or drop each patch before pushing.",
    },
    {
      title: "Give good work<br>a proper introduction.",
      body: "After your patch review, push the approved branches and open PRs against the correct base. Follow the project’s templates, sign-off, signing, and changelog requirements.",
      artifact: "A verifiable pull-request record",
      items: [
        "The PR URL and correct base and head",
        "The published commit SHA",
        "CI status, including missing or approval-gated CI",
      ],
      choice: "Review the published PRs and choose what to track.",
    },
    {
      title: "Stay for<br>the conversation.",
      body: "Follow CI, diagnose failures, and respond to maintainer review. Keep unresolved decisions visible. An open PR is never reported as a completed contribution.",
      artifact: "An honest contribution status",
      items: [
        "CI outcomes and failure root causes",
        "Review feedback and needed decisions",
        "Merged, closed with a reason, or parked",
      ],
      choice: "Choose how to resolve blockers and review feedback.",
    },
  ],
  zh: [
    {
      title: "先从你<br>关心的事开始。",
      body: "了解你的领域、语言与偏好的技术层次，再确认实际可用的硬件和算力。每次请求都由你设定兴趣，不默认沿用过去的选择。",
      artifact: "你的兴趣卡与能力卡",
      items: [
        "领域、语言与偏好的技术层次",
        "实际可用的硬件和算力",
        "为这次请求确认的兴趣与约束",
      ],
      choice: "这次要从哪些兴趣和可用资源出发？",
    },
    {
      title: "趁它还在生长，<br>发现它。",
      body: "探索 GitHub 每日与每周 Trending，默认关注一万星以下的项目。按你的兴趣排序，也留意刚刚超出范围的潜力项目。",
      artifact: "一份值得深入了解的候选清单",
      items: [
        "你选定星标范围内的候选项目",
        "每个项目为什么适合你的兴趣",
        "略超范围、值得继续观察的项目",
      ],
      choice: "哪些仓库值得进一步了解？",
    },
    {
      title: "看见邀请之后，<br>再看看证据。",
      body: "检查接纳记录、issue 回复、已有认领，以及修复真正属于哪个仓库。再判断以现有资源，能否从头到尾完成这件事。",
      artifact: "附有证据的 issue 菜单",
      items: [
        "谁的贡献被合并，谁的问题得到回复",
        "可参与的 issue 与合理的工作范围",
        "完成把握、资源约束和未知之处",
      ],
      choice: "哪些 issue 值得投入？",
    },
    {
      title: "把改动做好，<br>把验证留下。",
      body: "确认可行后认领 issue，按仓库自己的规范实现本地补丁与回归测试。准备 PR 文案，如实记录跑过什么、结果如何。",
      artifact: "等待你审阅的本地补丁",
      items: [
        "分支、差异和 PR 描述草稿",
        "实际执行的测试与结果",
        "已知限制，以及尚未验证的部分",
      ],
      choice: "推送前，逐个批准、调整或放弃补丁。",
    },
    {
      title: "让用心的工作，<br>得到妥善的介绍。",
      body: "你审阅补丁之后，才推送获准的分支并向正确的基分支发起 PR。遵循项目模板、签署、签名和变更日志要求。",
      artifact: "可以核对的 PR 记录",
      items: [
        "PR 地址与正确的 base / head 分支",
        "已发布提交的 SHA",
        "CI 状态，包括缺少 CI 或等待维护者批准",
      ],
      choice: "核对已提交的 PR，选择继续跟进的工作。",
    },
    {
      title: "参与，也包括<br>之后的对话。",
      body: "跟进 CI，定位失败原因，回应维护者审查。需要你决定的事明确提出；一个还开着的 PR，不会被当作已完成的贡献。",
      artifact: "如实呈现的贡献状态",
      items: [
        "CI 结果与失败的根本原因",
        "审查反馈与待决定的事项",
        "已合并、说明原因后关闭，或暂时搁置",
      ],
      choice: "如何解决阻碍、回应审查，由你决定。",
    },
  ],
};

let language = "en";
try {
  if (localStorage.getItem("landable-lang") === "zh") language = "zh";
} catch {
  /* Storage is optional. */
}
let stage = 2;
let statusTimer;
const atlas = document.querySelector(".atlas");
const stageButtons = [...document.querySelectorAll("[data-stage]")];
const menu = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#navigation");
const copyButton = document.querySelector(".copy-button");
const copyStatus = document.querySelector(".copy-status");

function renderStage() {
  const data = stages[language][stage];
  stageButtons.forEach((button) => {
    button.disabled = false;
    button.setAttribute(
      "aria-pressed",
      String(Number(button.dataset.stage) === stage),
    );
  });
  document.querySelector(".detail-index").textContent =
    `${String(stage + 1).padStart(2, "0")} / 06`;
  document.querySelector(".detail-title").innerHTML = data.title;
  document.querySelector(".detail-body").textContent = data.body;
  document.querySelector(".artifact-title").textContent = data.artifact;
  const items = data.items.map((text) => {
    const item = document.createElement("li");
    item.textContent = text;
    return item;
  });
  document.querySelector(".artifact-items").replaceChildren(...items);
  document.querySelector(".choice-text").textContent = data.choice;
  document.dispatchEvent(new Event("landable:content-change"));
}
function closeMenu(returnFocus = false) {
  const focusWouldBeHidden =
    matchMedia("(max-width: 600px)").matches &&
    navigation.contains(document.activeElement);
  menu.setAttribute("aria-expanded", "false");
  navigation.dataset.open = "false";
  menu.textContent = language === "zh" ? "菜单" : "Menu";
  if (returnFocus || focusWouldBeHidden) menu.focus();
}
function applyLanguage(next) {
  language = next;
  root.lang = language === "zh" ? "zh-CN" : "en";
  const dictionary = language === "zh" ? chinese : english;
  // Only authored strings enter these templates, never URL or external content.
  translatedNodes.forEach((node) => {
    if (dictionary[node.dataset.i18n] !== undefined)
      node.innerHTML = dictionary[node.dataset.i18n];
  });
  document
    .querySelectorAll("[data-lang]")
    .forEach((button) =>
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.lang === language),
      ),
    );
  copyButton.setAttribute(
    "aria-label",
    language === "zh" ? "复制安装命令" : "Copy installation command",
  );
  navigation.setAttribute(
    "aria-label",
    language === "zh" ? "主导航" : "Main navigation",
  );
  document
    .querySelector(".journey-stages")
    .setAttribute(
      "aria-label",
      language === "zh" ? "贡献阶段" : "Contribution stages",
    );
  const title =
    language === "zh"
      ? "landable — 在开源世界，找到你的落点"
      : "landable — Find your place in open source";
  const description =
    language === "zh"
      ? "从兴趣出发，发现值得早期加入的开源项目，评估真实的参与机会，完成一份契合的贡献。每个阶段，都由你选择下一步。"
      : "Find open-source projects worth joining early. An agent skill that follows your interests, checks real contribution openings, and helps your work land — with you choosing at every stage.";
  document.title = title;
  document.querySelector("meta[name=description]").content = description;
  document.querySelector('meta[property="og:title"]').content = title;
  document.querySelector('meta[property="og:description"]').content =
    description;
  clearTimeout(statusTimer);
  copyStatus.textContent = "";
  renderStage();
  closeMenu();
  try {
    localStorage.setItem("landable-lang", language);
  } catch {
    /* Browsing works without persistence. */
  }
}

document
  .querySelectorAll("[data-lang]")
  .forEach((button) =>
    button.addEventListener("click", () => applyLanguage(button.dataset.lang)),
  );
stageButtons.forEach((button) => {
  button.addEventListener("click", () => {
    stage = Number(button.dataset.stage);
    renderStage();
  });
  button.addEventListener("keydown", (event) => {
    let next;
    const focusedStage = Number(button.dataset.stage);
    if (event.key === "ArrowRight") next = (focusedStage + 1) % 6;
    if (event.key === "ArrowLeft") next = (focusedStage + 5) % 6;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = 5;
    if (next !== undefined) {
      event.preventDefault();
      stage = next;
      renderStage();
      stageButtons[next].focus();
    }
  });
});
menu.addEventListener("click", () => {
  const open = menu.getAttribute("aria-expanded") !== "true";
  menu.setAttribute("aria-expanded", String(open));
  navigation.dataset.open = String(open);
  menu.textContent =
    language === "zh" ? (open ? "关闭" : "菜单") : open ? "Close" : "Menu";
});
navigation.addEventListener("click", (event) => {
  const link = event.target.closest("a");
  if (!link) return;
  closeMenu();
  if (
    link.hash &&
    link.origin === location.origin &&
    link.pathname === location.pathname
  ) {
    document.getElementById(link.hash.slice(1))?.focus({ preventScroll: true });
  }
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menu.getAttribute("aria-expanded") === "true")
    closeMenu(true);
});
document.addEventListener("pointerdown", (event) => {
  if (
    menu.getAttribute("aria-expanded") === "true" &&
    !event.target.closest(".site-header")
  )
    closeMenu();
});
copyButton.addEventListener("click", async () => {
  clearTimeout(statusTimer);
  try {
    await navigator.clipboard.writeText("npx skills add Momoyeyu/landable -g");
    copyStatus.textContent =
      language === "zh"
        ? "已复制，可以粘贴到终端。"
        : "Copied. Ready for your terminal.";
  } catch {
    copyStatus.textContent =
      language === "zh"
        ? "未能复制。请选中命令后手动复制。"
        : "Copy unavailable. Select the command and copy it manually.";
  }
  statusTimer = setTimeout(() => {
    copyStatus.textContent = "";
  }, 5000);
});

// The chart is drawn once; its tiny perspective change only follows a pointer.
const svgNS = "http://www.w3.org/2000/svg";
const stars = document.querySelector(".background-stars");
let seed = 241026;
function random() {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
}
const starFragment = document.createDocumentFragment();
for (let i = 0; i < 90; i++) {
  const circle = document.createElementNS(svgNS, "circle");
  circle.setAttribute("cx", String(Math.round(35 + random() * 650)));
  circle.setAttribute("cy", String(Math.round(36 + random() * 494)));
  circle.setAttribute("r", String((0.5 + random() * 0.7).toFixed(1)));
  circle.setAttribute("opacity", String((0.15 + random() * 0.45).toFixed(2)));
  starFragment.append(circle);
}
stars.replaceChildren(starFragment);
const motion = matchMedia("(prefers-reduced-motion: reduce)");
const finePointer = matchMedia("(pointer: fine)");
let atlasVisible = true;
let frame = 0;
let pointerX = 0,
  pointerY = 0;
function resetPerspective() {
  cancelAnimationFrame(frame);
  frame = 0;
  atlas.style.setProperty("--parallax-x", "0px");
  atlas.style.setProperty("--parallax-y", "0px");
}
function paintPerspective() {
  frame = 0;
  if (
    root.classList.contains("story-mode") ||
    motion.matches ||
    !finePointer.matches ||
    !atlasVisible ||
    document.hidden
  )
    return;
  atlas.style.setProperty("--parallax-x", `${pointerX.toFixed(1)}px`);
  atlas.style.setProperty("--parallax-y", `${pointerY.toFixed(1)}px`);
}
atlas.addEventListener(
  "pointermove",
  (event) => {
    if (
      root.classList.contains("story-mode") ||
      motion.matches ||
      !finePointer.matches ||
      !atlasVisible ||
      document.hidden
    )
      return;
    const box = atlas.getBoundingClientRect();
    pointerX = ((event.clientX - box.left) / box.width - 0.5) * 8;
    pointerY = ((event.clientY - box.top) / box.height - 0.5) * 6;
    if (!frame) frame = requestAnimationFrame(paintPerspective);
  },
  { passive: true },
);
atlas.addEventListener("pointerleave", resetPerspective);
motion.addEventListener("change", resetPerspective);
finePointer.addEventListener("change", resetPerspective);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) resetPerspective();
});
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(([entry]) => {
    atlasVisible = entry.isIntersecting;
    if (!atlasVisible) resetPerspective();
  });
  observer.observe(atlas);
}
applyLanguage(language);
root.classList.add("is-enhanced");
const storyReady = import("./story.js")
  .then(({ createStory }) => createStory())
  .catch(() => {
    /* The full static reading layout is already available. */
  });

import("./contributions.mjs")
  .then(({ enhanceContributions }) => enhanceContributions())
  .catch(() => {
    /* The dated, verified contribution list remains readable without the API. */
  });

storyReady.then(() => import("./trending-atlas.mjs"))
  .then(({ enhanceAtlas }) => enhanceAtlas())
  .catch(() => { /* The verified first Trending group remains visible. */ });
