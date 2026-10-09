<p align="center">
  <a href="./README.md">English</a> · <strong>简体中文</strong>
</p>

<p align="center">
  <img src="docs/diagrams/landable.brand.zh.svg" alt="landable" width="620">
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-22c55e?style=flat-square" alt="MIT License" /></a>
  <a href="landable/SKILL.md"><img src="https://img.shields.io/badge/Agent-Skill-7C3AED?style=flat-square" alt="Agent Skill" /></a>
</p>

GitHub 上躺着想被修的 issue 很多，但真正能被外部人修掉的很少：看中的 issue 几小时前刚被人认领；仓库的 merge 记录翻到底全是 maintainer 自己；追了半天发现病根在依赖仓库里，PR 根本不该提到这；又或者补丁本身没问题，只是永远没人 review——因为外部人的 PR 从来没人 review 过。

landable 是一个围绕这个观察做的 Agent Skill：**难的很少是写补丁本身，是判断这个补丁在哪里能落得了地。** 它覆盖从兴趣画像到合并 PR 的完整链路，流程提炼自一次真实的工作流，而不是理想化的流程图。

```bash
npx skills add Momoyeyu/landable -g
```

## 它具体做什么

![流水线](docs/diagrams/landable.pipeline.zh.svg)

六个阶段，但你只需要做**两个决定**：

- **决定做什么。** Agent 按你的星数区间扫 GitHub Trending，再逐个探测仓库的真实开放度——外部人的 PR 到底有没有被 merge 过、issue 有没有人回、病根在不在这个仓库——然后带回一份排序好的菜单。你来挑。
- **决定发什么。** Agent fork、认领、实现、写测试、拟 PR 文案——然后停下。它交给你一份补丁清单：改了什么、跑了什么、还缺什么。你逐个批准、打回、或者放弃。

两道闸门之间它是自主的；第二道闸门之后，它推送、按正确的 base 开 PR、盯着 CI 直到 maintainer 接手。

![两道闸门](docs/diagrams/landable.gates.zh.svg)

## 大多数工具跳过的那部分

真正值钱的阶段不是写代码，是**评估**。landable 会查一些 agent 通常不查的事：

- **外人真的能被 merge 吗？** 抽样近期 merged PR 的 `authorAssociation` 分布。如果全是 `OWNER`，那这是个熟人俱乐部，issue 再好也别去。
- **病根在这个仓库吗？** bug 在这个仓库发作，根可能在它的依赖里——动手前先顺着 import 查清楚 PR 该提到哪。
- **issue 真的没人做吗？** 已被认领的直接跳过，不去抢。认领速度本身就记为信号。
- **这个改动 review 能过吗？** 涉及安全模型、架构边界的重写，写成方案评论交给 maintainer 定方向，绝不闷头改。

到了出口端也一样：仓库自己的规则最大。base 分支、sign-off、加密签名、changelog、PR 模板、文档规定的测试门禁——写代码之前先从 `CONTRIBUTING.md`/`AGENTS.md` 里读完。

## 你会拿到什么

| 时机 | 产物 |
|---|---|
| Scout 之后 | 候选排序表——星数、语言、为什么适合你的画像，外加刚好超出区间上限的观察名单 |
| Assess 之后 | 各仓库 issue 菜单——接受度证据、工作量估计、agent 能否端到端做完的诚实把握 |
| Implement 之后 | 补丁清单——每个改动：分支、diff、实际跑过的测试和结果、已知限制 |
| Ship 之后 | PR 表——URL、base/head、SHA，以及诚实上报的 CI 状态：「没有 CI」和「等 maintainer 批准」是两回事 |
| 终态 | 状态报告——merged、closed-with-reason、或者搁置。open 的 PR 不会被报成完成 |

所有面向真人的东西——issue 评论、commit message、PR 正文——都按贡献者的写法来写：简洁、技术化、用仓库的主要语言、不带工具署名。

## 真的能落地吗

用 landable 找到并成功贡献的精选案例——下面的链接都指向已合并的 PR。

### [tt-a1i/archify](https://github.com/tt-a1i/archify) [![stars](https://img.shields.io/github/stars/tt-a1i/archify?style=flat-square)](https://github.com/tt-a1i/archify)

把想法和代码库变成交互图的 Agent Skill。repair-rounds 基准测试暴露了诊断信息难以指导修复的问题，于是改进悬空端点诊断、修复建议和回执，再补齐基准测试的盲区。先前手动完成的 #634 **不计入** landable 案例。

已合并：[#654](https://github.com/tt-a1i/archify/pull/654)（结构化诊断与修复建议，关联 #594）、[#707](https://github.com/tt-a1i/archify/pull/707)（基准测试覆盖，关联 #670）。

### [MakazhanAlpamys/Soup](https://github.com/MakazhanAlpamys/Soup) [![stars](https://img.shields.io/github/stars/MakazhanAlpamys/Soup?style=flat-square)](https://github.com/MakazhanAlpamys/Soup)

一份 YAML 就能微调 LLM，layer streaming 还能在小显存 GPU 上训练。这里找到的 issue 能在现有硬件上验证：追查共享答案解析器而非只改症状，也按 maintainer 的反馈收窄改动范围。

已合并：[#1375](https://github.com/MakazhanAlpamys/Soup/pull/1375)（恢复 32 个 MPS 测试，修复 #1355）、[#1471](https://github.com/MakazhanAlpamys/Soup/pull/1471)（可解析的推理答案，修复 #1349）、[#1490](https://github.com/MakazhanAlpamys/Soup/pull/1490)（自定义评估按最终答案打分，修复 #1342）、[#1533](https://github.com/MakazhanAlpamys/Soup/pull/1533)（数值答案解析及拒绝原因，修复 #1350）、[#1630](https://github.com/MakazhanAlpamys/Soup/pull/1630)（离散奖励不误报 reward hacking，修复 #1438）。

### [ovg-project/kvcached](https://github.com/ovg-project/kvcached) [![stars](https://img.shields.io/github/stars/ovg-project/kvcached?style=flat-square)](https://github.com/ovg-project/kvcached)

面向 GPU 工作负载的弹性 KV cache。旧 listener 延迟关闭时会误删同名替换者正在使用的 Unix socket；修复通过 socket 身份判断是否能 unlink，并覆盖与新 listener 并存的停机时序。

已合并：[#519](https://github.com/ovg-project/kvcached/pull/519)（关联 #510）。

### [Tencent-Hunyuan/UniRL](https://github.com/Tencent-Hunyuan/UniRL) [![stars](https://img.shields.io/github/stars/Tencent-Hunyuan/UniRL?style=flat-square)](https://github.com/Tencent-Hunyuan/UniRL)

多模态强化学习框架。第一个 issue 要确认按 key 匹配的分片状态辅助函数既有风险又确实无调用；第二个要对齐 SGLang rollout 的 log-prob 约定，同时不改变训练侧 loss 的缩放。两项改动都先验证再提交。

已合并：[#530](https://github.com/Tencent-Hunyuan/UniRL/pull/530)（删除不理解 adapter 的辅助函数，修复 #514）、[#536](https://github.com/Tencent-Hunyuan/UniRL/pull/536)（对齐 CPS rollout log-prob，修复 #533）。

## 试试看

装好 skill，直接说：

```text
帮我找 10k 星以下有潜力的 AI 基础设施仓库——要有我实际能落地的 issue。
```

```text
我的兴趣：CUDA 性能、LLM 量化、C++/Python 工具链。
```

```text
看看我还没合并的贡献 PR 有什么进展，有 CI 失败就跟进。
```

第一个请求会先建兴趣卡和候选排序表，然后问你想深入评估哪几个仓库。推送任何内容都要等你明确点头——这是硬闸门，不是建议。

## 辅助脚本

skill 自带三个零依赖小工具，不用它们流程也照样跑：

```bash
python3 landable/scripts/trending.py --weekly --min-stars 1000 --max-stars 5000   # Trending 按星数区间过滤
python3 landable/scripts/probe.py --repo OWNER/NAME                              # 仓库摘要：规则、接受度、issue 分诊
python3 landable/scripts/acceptance.py --repo OWNER/NAME                          # 独立的外部 PR 接受度探测
```

## Skill 结构

| 文件 | 何时加载 |
|---|---|
| [`landable/SKILL.md`](landable/SKILL.md) | 入口：流水线、闸门、路由 |
| [`references/scout.md`](landable/references/scout.md) | 发现和排序候选仓库 |
| [`references/assess.md`](landable/references/assess.md) | 判断仓库开放度、挑选 issue |
| [`references/implement.md`](landable/references/implement.md) | fork、认领、编码、提交 |
| [`references/ship.md`](landable/references/ship.md) | 推送、开 PR、跟踪 CI |
| [`scripts/trending.py`](landable/scripts/trending.py) | 运行而非阅读 |
| [`scripts/probe.py`](landable/scripts/probe.py) | 运行而非阅读 |
| [`scripts/acceptance.py`](landable/scripts/acceptance.py) | 运行而非阅读 |

渐进式披露：只读当前阶段的 reference。

## 开发

```bash
uv run --with pytest python -m pytest tests/ -v
```

图都在 `docs/diagrams/`——Archify JSON 源文件 finalize 成独立 HTML 后导出双主题 SVG，外加手绘的 brand lockup。重新生成：`archify finalize <type> <json> <html> --quality showcase`，然后在 HTML viewer 里 Export → SVG。

## License

[MIT](LICENSE)
