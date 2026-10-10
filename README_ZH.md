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

GitHub 上等着被修的 issue 很多，但真正能被外部人修掉的很少。看中的 issue 可能几小时前刚被人认领；有的仓库 merge 记录翻到底全是 maintainer 自己；追了半天发现问题的根在依赖仓库，PR 根本不该提到这；又或者补丁本身没问题，只是永远没人 review——因为外部人的 PR 从来就没人看。

landable 就是围绕这件事做的 Agent Skill：**难的一般不是写补丁，而是想清楚这个补丁提给哪个项目才有人接。** 它覆盖从兴趣到 PR 合并的完整流程，流程本身也是从真实使用中打磨出来的，不是画在纸上的理想化步骤。

```bash
npx skills add Momoyeyu/landable -g
```

## 它是怎么工作的

![流水线](docs/diagrams/landable.pipeline.zh.svg)

六个阶段，但你只需要做**两个决定**：

- **决定做什么。** Agent 按你给的 star 范围扫 GitHub Trending，再逐个看仓库对外部贡献的真实态度——外人的 PR 有没有被合过、issue 有没有人回、问题在不在这个仓库——最后带回一份排好序的候选名单，你来挑。
- **决定发什么。** Agent fork、认领、实现、写测试、拟好 PR 文案——然后停下，交给你一份补丁清单：改了什么、验证了什么、还缺什么。你逐个批准、打回或者放弃。

两个决定点之间它自己干活；你点头之后，它推送分支、按正确的 base 开 PR、盯 CI 盯到 maintainer 接手。

![两道闸门](docs/diagrams/landable.gates.zh.svg)

## 多数工具都会跳过的环节

真正值钱的不是写代码那步，是前面的**评估**。landable 会替你把几件大部分工具懒得查的事查清楚：

- **外部 PR 真的有人接吗？** 抽样最近合并的 PR，看 `authorAssociation`。要是清一色 `OWNER`，那这是个熟人俱乐部，issue 再好也别去。
- **问题真在这个仓库吗？** 报错出现在 A 仓库，根可能埋在依赖 B 里——动手之前先顺着代码查清楚 PR 到底该提到哪。
- **issue 真的还空着吗？** 有人认领的就跳过，不抢。抢手的项目本身也是个信号。
- **改动能过 review 吗？** 动安全模型、架构边界这种事，先写成方案评论让 maintainer 定方向，不闷头写。

最后一步也一样，项目自己的规矩最大：目标分支、sign-off、签名、changelog、PR 模板、要求的测试——动手前先把 `CONTRIBUTING.md`/`AGENTS.md` 读完。

## 你会拿到什么

| 时机 | 产物 |
|---|---|
| Scout 之后 | 候选排序表——star 数、语言、为什么适合你的方向，外加一份略超范围但值得留意的名单 |
| Assess 之后 | 每个仓库的 issue 清单——接受度证据、工作量估计，以及 agent 有多大把握自己做完（说真话，不吹） |
| Implement 之后 | 补丁清单——每个改动：分支、diff、实际跑过的测试和结果、已知限制 |
| Ship 之后 | PR 表——URL、base/head、SHA，CI 状态如实上报：「没有 CI」和「在等 maintainer 批准」是两回事 |
| 最终状态 | 结果报告——merged、被关闭（说明原因）、或者搁置；open 的一律不算完成 |

所有要给真人看的内容——issue 评论、commit message、PR 正文——都按普通贡献者的写法来：简洁、技术、用项目的主要语言，不带工具署名。

## 真的能落地吗

用 landable 找到并成功贡献的精选案例——下面的链接都指向已合并的 PR。

### [tt-a1i/archify](https://github.com/tt-a1i/archify) [![stars](https://img.shields.io/github/stars/tt-a1i/archify?style=flat-square)](https://github.com/tt-a1i/archify)

把想法和代码库变成交互图的 Agent Skill。repair-rounds 基准测试暴露了诊断信息难以指导修复的问题，于是改进悬空端点诊断、修复建议和回执，再补齐基准测试的盲区。之前手动做的 #634 不算在里面。

已合并：[#654](https://github.com/tt-a1i/archify/pull/654)（结构化诊断与修复建议，关联 #594）、[#707](https://github.com/tt-a1i/archify/pull/707)（基准测试覆盖，关联 #670）。

### [MakazhanAlpamys/Soup](https://github.com/MakazhanAlpamys/Soup) [![stars](https://img.shields.io/github/stars/MakazhanAlpamys/Soup?style=flat-square)](https://github.com/MakazhanAlpamys/Soup)

一份 YAML 就能微调 LLM，layer streaming 还能在小显存 GPU 上训练。挑的都是能在现有硬件上验证的 issue：顺着共享的答案解析器去修，而不是哪里报错改哪里；也按 maintainer 的反馈及时收窄改动范围。

已合并：[#1375](https://github.com/MakazhanAlpamys/Soup/pull/1375)（恢复 32 个 MPS 测试，修复 #1355）、[#1471](https://github.com/MakazhanAlpamys/Soup/pull/1471)（可解析的推理答案，修复 #1349）、[#1490](https://github.com/MakazhanAlpamys/Soup/pull/1490)（自定义评估按最终答案打分，修复 #1342）、[#1533](https://github.com/MakazhanAlpamys/Soup/pull/1533)（数值答案解析及拒绝原因，修复 #1350）、[#1630](https://github.com/MakazhanAlpamys/Soup/pull/1630)（离散奖励不误报 reward hacking，修复 #1438）。

### [ovg-project/kvcached](https://github.com/ovg-project/kvcached) [![stars](https://img.shields.io/github/stars/ovg-project/kvcached?style=flat-square)](https://github.com/ovg-project/kvcached)

面向 GPU 工作负载的弹性 KV cache。旧 listener 停止时可能误删新 listener 在用的同名 Unix socket；补丁先核对 socket 归属再 unlink，还补了新旧并存时停机时序的测试。

已合并：[#519](https://github.com/ovg-project/kvcached/pull/519)（关联 #510）。

### [Tencent-Hunyuan/UniRL](https://github.com/Tencent-Hunyuan/UniRL) [![stars](https://img.shields.io/github/stars/Tencent-Hunyuan/UniRL?style=flat-square)](https://github.com/Tencent-Hunyuan/UniRL)

多模态强化学习框架。第一个 issue 要先证明那几个按 key 匹配张量的辅助函数确实没人调用、删掉才安全；第二个要对齐 SGLang rollout 的 log-prob 口径，又不能动训练侧的 loss 缩放。两个都是先验证再提。

已合并：[#530](https://github.com/Tencent-Hunyuan/UniRL/pull/530)（删除未考虑 adapter 的辅助函数，修复 #514）、[#536](https://github.com/Tencent-Hunyuan/UniRL/pull/536)（对齐 CPS rollout log-prob，修复 #533）。

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

第一条消息会先整理你的兴趣和候选项目，再问你要深入看哪几个。任何推送都要等你明确点头——这是硬规矩，不是建议。

## 辅助脚本

skill 自带三个零依赖小工具，不用它们流程也照样跑：

```bash
python3 landable/scripts/trending.py --weekly --min-stars 1000 --max-stars 5000   # 按 star 范围筛 Trending
python3 landable/scripts/probe.py --repo OWNER/NAME                              # 仓库概况：规则、接受度、issue 排查
python3 landable/scripts/acceptance.py --repo OWNER/NAME                          # 单独查外部 PR 接受度
```

## Skill 结构

| 文件 | 何时加载 |
|---|---|
| [`landable/SKILL.md`](landable/SKILL.md) | 入口：流水线、闸门、路由 |
| [`references/scout.md`](landable/references/scout.md) | 发现并排序候选仓库 |
| [`references/assess.md`](landable/references/assess.md) | 判断仓库开放度、挑选 issue |
| [`references/implement.md`](landable/references/implement.md) | fork、认领、编码、提交 |
| [`references/ship.md`](landable/references/ship.md) | 推送、开 PR、跟踪 CI |
| [`scripts/trending.py`](landable/scripts/trending.py) | 运行而非阅读 |
| [`scripts/probe.py`](landable/scripts/probe.py) | 运行而非阅读 |
| [`scripts/acceptance.py`](landable/scripts/acceptance.py) | 运行而非阅读 |

按需加载：用到哪个阶段再读哪个 reference。

## 开发

```bash
uv run --with pytest python -m pytest tests/ -v
```

图在 `docs/diagrams/`：Archify JSON 先 finalize 成独立 HTML，再导出深浅双主题 SVG，logo 是另外手绘的。重新生成：`archify finalize <type> <json> <html> --quality showcase`，然后在 HTML viewer 里 Export → SVG。

## License

[MIT](LICENSE)
