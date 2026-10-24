import test from "node:test";
import assert from "node:assert/strict";
import { refreshContributions, sortProjects } from "../web/contributions.mjs";

const projects = [
  { repo: "tt-a1i/archify", minimumPR: 654, stars: 20, prs: [{ number: 654, title: "Original" }] },
  { repo: "MakazhanAlpamys/Soup", minimumPR: 1375, stars: 10, prs: [{ number: 1375, title: "Original" }] },
];
const pr = (repo, number, extra = {}) => ({
  repository_url: `https://api.github.com/repos/${repo}`,
  number, title: `Fix ${number}`, user: { login: "Momoyeyu" },
  html_url: `https://github.com/${repo}/pull/${number}`,
  pull_request: { merged_at: "2026-10-24T00:00:00Z" }, ...extra,
});
const response = (body, status = 200) => ({ ok: status === 200, status, json: async () => body });

test("fetches current stars, adds newly merged PRs and sorts numerically", async () => {
  const calls = [];
  const result = await refreshContributions(projects, async (url, options) => {
    calls.push({ url, options });
    if (url.includes("/search/issues")) return response({ total_count: 3, incomplete_results: false,
      items: [pr("tt-a1i/archify", 1059), pr("tt-a1i/archify", 654), pr("MakazhanAlpamys/Soup", 2067)] });
    return response({ stargazers_count: url.endsWith("Soup") ? 1000 : 99 });
  });
  assert.equal(result.complete, true);
  assert.deepEqual(result.projects.map(p => p.repo), ["MakazhanAlpamys/Soup", "tt-a1i/archify"]);
  assert.deepEqual(result.projects[1].prs.map(p => p.number), [1059, 654]);
  assert.equal(calls.length, 3);
  assert.ok(calls.every(c => c.options.credentials === "omit" && c.options.cache === "no-store"));
  assert.equal(projects[0].stars, 20, "never mutate the fallback");
});

test("reads all search pages instead of silently stopping at 100 results", async () => {
  const pages = [];
  const result = await refreshContributions(projects, async url => {
    if (!url.includes("/search/issues")) return response({ stargazers_count: 1 });
    const page = Number(new URL(url).searchParams.get("page")); pages.push(page);
    return response({ total_count: 101, incomplete_results: false,
      items: page === 1 ? Array.from({length:100}, (_, i) => pr("tt-a1i/archify", 1000 + i)) : [pr("MakazhanAlpamys/Soup", 2067)] });
  });
  assert.equal(result.complete, true);
  assert.deepEqual(pages, [1, 2]);
  assert.equal(result.projects.find(p => p.repo.endsWith("Soup")).prs[0].number, 2067);
});

test("limits the feed to merged PRs by the contributor in the selected case studies", async () => {
  const result = await refreshContributions(projects, async url => url.includes("/search/issues")
    ? response({ total_count: 7, incomplete_results: false, items: [
      pr("tt-a1i/archify", 1059), pr("tt-a1i/archify", 1059), pr("tt-a1i/archify", 634),
      pr("tt-a1i/archify", 2000, { pull_request: { merged_at: null } }),
      pr("tt-a1i/archify", 2001, { user: { login: "someone-else" } }),
      pr("elsewhere/repo", 2002), pr("MakazhanAlpamys/Soup", 2067, { html_url: "javascript:alert(1)" }),
    ] }) : response({ stargazers_count: 1 }));
  assert.deepEqual(result.projects.find(p => p.repo.endsWith("archify")).prs.map(p => p.number), [1059]);
  assert.deepEqual(result.projects.find(p => p.repo.endsWith("Soup")).prs, []);
});

for (const failure of ["rate-limit", "network", "incomplete", "search-cap"]) {
  test(`${failure}: preserves fallback PRs and labels the update incomplete`, async () => {
    const result = await refreshContributions(projects, async url => {
      if (!url.includes("/search/issues")) return response({ stargazers_count: 500 });
      if (failure === "network") throw new TypeError("offline");
      if (failure === "rate-limit") return response({}, 403);
      return response({ total_count: failure === "search-cap" ? 1001 : 1,
        incomplete_results: failure === "incomplete", items: [pr("tt-a1i/archify", 1059)] });
    });
    assert.equal(result.complete, false);
    assert.deepEqual(result.projects.find(p => p.repo.endsWith("archify")).prs, projects[0].prs);
  });
}

test("one failed repo request does not discard successful star and PR updates", async () => {
  const result = await refreshContributions(projects, async url => {
    if (url.includes("/search/issues")) return response({ total_count: 1, incomplete_results: false, items:[pr("tt-a1i/archify",1059)] });
    return url.endsWith("Soup") ? response({}, 429) : response({ stargazers_count: 9000 });
  });
  assert.equal(result.complete, false);
  assert.equal(result.projects[0].stars, 9000);
  assert.equal(result.projects[1].stars, 10);
  assert.equal(result.projects[0].prs[0].number, 1059);
});

test("missing star counts are not replaced by zero and ties have a stable order", async () => {
  const result = await refreshContributions(projects, async url => url.includes("/search/issues")
    ? response({total_count:0,incomplete_results:false,items:[]}) : response({}));
  assert.equal(result.complete, false);
  assert.deepEqual(result.projects.map(p => p.stars), [20,10]);
  assert.deepEqual(sortProjects([{repo:"z/b",stars:9},{repo:"a/b",stars:9}]).map(p => p.repo), ["a/b","z/b"]);
});
