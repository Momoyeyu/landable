"""Website Trending snapshots reuse the skill's parser and preserve daily rank."""
import importlib.util
import unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location("website_data", Path(__file__).parents[1] / "scripts/update_website_data.py")
website_data = importlib.util.module_from_spec(spec)
spec.loader.exec_module(website_data)

class WebsiteDataTests(unittest.TestCase):
  def test_snapshot_is_ranked_not_sorted_by_lifetime_stars(self):
    page = "".join(f'''<article><h2><a href="/owner/repo-{i}">repo</a></h2>
      <p class="col-9">A useful &amp; public project</p><span itemprop="programmingLanguage">Python</span>
      <a href="/owner/repo-{i}/stargazers">{100+i}</a></article>''' for i in range(25))
    result = website_data.trending_snapshot(page)
    assert len(result["repositories"]) == 20
    assert result["repositories"][0]["name"] == "owner/repo-0"
    assert result["repositories"][-1]["name"] == "owner/repo-19"
    assert result["source"] == "https://github.com/trending?since=daily"
    assert result["repositories"][0]["desc"] == "A useful & public project"

  def test_empty_or_blocked_page_cannot_overwrite_a_valid_snapshot(self):
    with self.assertRaises(ValueError):
        website_data.trending_snapshot("<h1>Rate limited</h1>")

if __name__ == "__main__":
    unittest.main()
