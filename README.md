<p align="center">
  <strong>English</strong> · <a href="./README_ZH.md">简体中文</a>
</p>

<p align="center">
  <img src="docs/diagrams/landable.brand.svg" alt="landable" width="620">
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-22c55e?style=flat-square" alt="MIT License" /></a>
  <a href="landable/SKILL.md"><img src="https://img.shields.io/badge/Agent-Skill-7C3AED?style=flat-square" alt="Agent Skill" /></a>
</p>

GitHub is full of issues that want fixing — and most of them can't actually be closed by you. The issue was claimed hours before you found it; the repo's merge history is 100% maintainer commits; the bug you chased roots in a dependency, not the repo it was filed against; or your patch is fine and simply never gets reviewed, because outsiders never do.

landable is an Agent Skill built around that observation: **the patch is rarely the hard part — knowing where it can land is.** It walks the full arc from your interests to a merged PR, and it was distilled from a real working session rather than an idealized flowchart.

```bash
npx skills add Momoyeyu/landable -g
```

## What it actually does

![pipeline](docs/diagrams/landable.pipeline.svg)

Six stages, but you only ever make **two decisions**:

- **Pick what to work on.** The agent scouts GitHub Trending within your star range, probes each repo's real openness — who actually gets merged, whether issues get maintainer replies, whether the fix even lives in that repo — and comes back with a ranked menu. You choose.
- **Approve what gets published.** The agent forks, claims, implements, tests, and writes the PR text — then stops. It hands you a patch list: what changed, what ran, what's missing. You approve, adjust, or drop each one.

Between those two gates it's autonomous. After the second, it pushes, opens the PR on the right base branch, and babysits CI until the maintainer takes over.

![the two gates](docs/diagrams/landable.gates.svg)

## The part most tools skip

The interesting stage isn't implementation — it's **assessment**. landable checks things agents usually don't:

- **Do outsiders get merged?** It samples recent merged PRs by `authorAssociation`. A repo where every merge is `OWNER` is a closed club, no matter how good the issues look.
- **Does the fix live here?** Bugs surface in one repo but root in its dependencies — the agent follows imports before committing to a target.
- **Is the issue actually free?** Claimed issues are skipped, not raced. Fast-moving queues get noted, not gamed.
- **Will this scope survive review?** Security-model changes and architectural redesigns get proposed to maintainers as comments, never implemented blind.

And on the way out: the repo's own rules win. Base branch, sign-off, cryptographic signing, changelog, PR template, the documented test gate — read from `CONTRIBUTING.md`/`AGENTS.md` before anything is written.

## What you get back

| Moment | Artifact |
|---|---|
| After Scout | Ranked candidate table — stars, language, why it fits *your* profile, plus a flagged watch list just over the range |
| After Assess | Issue menu per repo — acceptance evidence, effort estimate, honest confidence the agent can finish end-to-end |
| After Implement | Patch list — per change: branch, diff, tests actually run with results, known limitations |
| After Ship | PR table — URL, base/head, SHA, and CI status reported honestly: *no CI* and *waiting on maintainer approval* are not the same thing |
| Terminal | Status report — merged, closed-with-reason, or parked. An open PR is never reported as done |

Everything that faces a human — issue comments, commit messages, PR bodies — is written like a contributor wrote it: concise, technical, in the repository's primary language, no tool attribution.

## Does it land?

Selected contributions found through landable — every link below is a merged PR.

### [tt-a1i/archify](https://github.com/tt-a1i/archify) [![stars](https://img.shields.io/github/stars/tt-a1i/archify?style=flat-square)](https://github.com/tt-a1i/archify)

An agent skill for turning ideas and codebases into interactive diagrams. After the repair-rounds benchmark exposed where diagnostics made fixes harder, contributions improved structured endpoint errors and actionable repair suggestions, then filled benchmark blind spots. The benchmark work informed follow-up fixes; the earlier manually completed #634 is **not** a landable example.

Merged here: [#654](https://github.com/tt-a1i/archify/pull/654) (diagnostics and repairability, refs #594), [#707](https://github.com/tt-a1i/archify/pull/707) (benchmark coverage, refs #670).

### [MakazhanAlpamys/Soup](https://github.com/MakazhanAlpamys/Soup) [![stars](https://img.shields.io/github/stars/MakazhanAlpamys/Soup?style=flat-square)](https://github.com/MakazhanAlpamys/Soup)

LLM fine-tuning from a single YAML, with layer streaming for smaller GPUs. Matching meant finding issues that could be verified on available hardware, tracing shared answer parsing rather than patching symptoms, and adapting scope to maintainer feedback.

Merged here: [#1375](https://github.com/MakazhanAlpamys/Soup/pull/1375) (restore 32 MPS test cases, fixes #1355), [#1471](https://github.com/MakazhanAlpamys/Soup/pull/1471) (parseable reasoning answers, fixes #1349), [#1490](https://github.com/MakazhanAlpamys/Soup/pull/1490) (custom evaluation answer scoring, fixes #1342), [#1533](https://github.com/MakazhanAlpamys/Soup/pull/1533) (numeric reward golds and rejected references, fixes #1350), [#1630](https://github.com/MakazhanAlpamys/Soup/pull/1630) (avoid false reward-hacking alarms on discrete rewards, fixes #1438).

### [ovg-project/kvcached](https://github.com/ovg-project/kvcached) [![stars](https://img.shields.io/github/stars/ovg-project/kvcached?style=flat-square)](https://github.com/ovg-project/kvcached)

Elastic KV-cache sharing for GPU workloads. A same-name listener replacement could lose its live Unix socket when the old listener stopped. The fix checks socket identity before unlinking and covers delayed shutdown against a live replacement.

Merged here: [#519](https://github.com/ovg-project/kvcached/pull/519) (refs #510).

### [Tencent-Hunyuan/UniRL](https://github.com/Tencent-Hunyuan/UniRL) [![stars](https://img.shields.io/github/stars/Tencent-Hunyuan/UniRL?style=flat-square)](https://github.com/Tencent-Hunyuan/UniRL)

Multimodal reinforcement learning. The first issue needed proof that unused sharded-state helpers were unsafe and truly dead; the second needed matching the SGLang rollout log-prob convention without changing training-side loss scaling. Both were scoped and verified before submission.

Merged here: [#530](https://github.com/Tencent-Hunyuan/UniRL/pull/530) (remove adapter-unaware helpers, fixes #514), [#536](https://github.com/Tencent-Hunyuan/UniRL/pull/536) (align CPS rollout log-probs, fixes #533).

## Try it

Install the skill, then just ask:

```text
Find me promising AI-infra repos under 10k stars — issues I could realistically land.
```

```text
My interests: CUDA performance, LLM quantization, C++/Python tooling.
```

```text
Check my open contribution PRs. Follow up any CI failures.
```

The first request builds an interest card and a ranked table, then asks which repos deserve a deeper look. Pushing anything always waits for your explicit go — that's a hard gate, not a suggestion.

## Helper scripts

Three small stdlib-only tools ship with the skill; the pipeline works fine without them:

```bash
python3 landable/scripts/trending.py --weekly --min-stars 1000 --max-stars 5000   # Trending in a star range
python3 landable/scripts/probe.py --repo OWNER/NAME                              # repo digest: rules, acceptance, issue triage
python3 landable/scripts/acceptance.py --repo OWNER/NAME                          # standalone external-merge probe
```

## Skill structure

| File | Load when |
|---|---|
| [`landable/SKILL.md`](landable/SKILL.md) | Entry: pipeline, gates, routing |
| [`references/scout.md`](landable/references/scout.md) | Discovering and ranking candidates |
| [`references/assess.md`](landable/references/assess.md) | Judging repo openness, picking issues |
| [`references/implement.md`](landable/references/implement.md) | Forking, claiming, coding, committing |
| [`references/ship.md`](landable/references/ship.md) | Pushing, PRs, tracking CI |
| [`scripts/trending.py`](landable/scripts/trending.py) | Run, not read |
| [`scripts/probe.py`](landable/scripts/probe.py) | Run, not read |
| [`scripts/acceptance.py`](landable/scripts/acceptance.py) | Run, not read |

Progressive disclosure: read the current stage's reference only.

## Development

```bash
uv run --with pytest python -m pytest tests/ -v
```

Diagrams live in `docs/diagrams/` — Archify JSON sources finalized to standalone HTML and exported as auto-themed SVG, plus the hand-drawn brand lockup. Regenerate with `archify finalize <type> <json> <html> --quality showcase`, then Export → SVG from the HTML viewer.

## License

[MIT](LICENSE)
