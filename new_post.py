"""Create a new blog post with auto-filled date and number.

Usage:
  python new_post.py "文章标题"
  python new_post.py "文章标题" "合集名"
  python new_post.py "文章标题" -t "Tag1, Tag2"
  python new_post.py "文章标题" -s "摘要" -t "Tag1, Tag2"
"""
import os
import re
import sys
import json
import argparse
from datetime import date

# Fix Windows console encoding
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")


POSTS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "posts")
INDEX_FILE = os.path.join(POSTS_DIR, "index.json")


def next_number():
    """Find the highest numbered post and return the next number."""
    highest = 0
    for f in os.listdir(POSTS_DIR):
        m = re.match(r"^(\d+)-", f)
        if m:
            highest = max(highest, int(m.group(1)))
    return highest + 1


def slugify(title):
    """Turn a Chinese/English title into a filename-safe slug."""
    # Keep Chinese characters, letters, digits, dashes
    safe = re.sub(r"[^\w一-鿿\-]+", "-", title.strip())
    safe = safe.strip("-")
    return safe if safe else "untitled"


def create_post(title, series=None, tags=None, summary=None):
    num = next_number()
    slug = slugify(title)
    filename = f"{num:03d}-{slug}.md"
    filepath = os.path.join(POSTS_DIR, filename)

    d = date.today()
    today = f"{d.year}-{d.month}-{d.day}"  # 2026-7-20

    # Build frontmatter
    lines = ["---"]
    lines.append(f"title: {title}")
    lines.append(f"date: {today}")
    if series:
        lines.append(f"series: {series}")
    if summary:
        lines.append(f"summary: {summary}")
    if tags:
        lines.append("tags:")
        for t in tags:
            lines.append(f"    - {t.strip()}")
    else:
        lines.append("tags: []")
    lines.append("---")
    lines.append("")
    lines.append("")  # blank line for body

    os.makedirs(POSTS_DIR, exist_ok=True)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    # Update index.json
    post_id = filename.replace(".md", "")
    index = []
    if os.path.exists(INDEX_FILE):
        with open(INDEX_FILE, "r", encoding="utf-8") as f:
            index = json.load(f)
    index.insert(0, post_id)
    with open(INDEX_FILE, "w", encoding="utf-8") as f:
        json.dump(index, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print(f"Created: posts/{filename}")
    print(f"Date:    {today}")
    print(f"Series:  {series or '(none)'}")
    print(f"Tags:    {', '.join(tags) if tags else '(none)'}")
    print(f"Index:   auto-added to posts/index.json")
    print(f"\nEdit the file and git push when ready.")


def main():
    parser = argparse.ArgumentParser(description="Create a new blog post")
    parser.add_argument("title", help="Post title")
    parser.add_argument("series", nargs="?", default=None, help="Series name (optional)")
    parser.add_argument("-t", "--tags", default=None, help="Tags, comma-separated (e.g. 'Python, Web')")
    parser.add_argument("-s", "--summary", default=None, help="Short summary (optional)")
    args = parser.parse_args()

    tags = None
    if args.tags:
        tags = [t.strip() for t in args.tags.split(",") if t.strip()]

    create_post(args.title, args.series, tags, args.summary)


if __name__ == "__main__":
    main()
