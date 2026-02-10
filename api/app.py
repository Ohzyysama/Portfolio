import os
import frontmatter
import markdown
from flask import Flask, render_template, url_for, abort

app = Flask(
    __name__,
    template_folder="../templates",
    static_folder="../static"
)

my_profile = {
    "name": "Chou",
    "title": "NJU Software Engineering Drudge",
    "bio": "努力生活中...",
    "email": "231250040@smail.nju.edu.cn",
    "social_links": [
        {"name": "GitHub", "url": "https://github.com/Ohzyysama"},
        {"name": "Gitee", "url": "https://gitee.com/ohzyysama"}
    ]
}

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
POSTS_DIR = os.path.join(BASE_DIR, "..", "posts")

def get_profile_with_avatar():
    profile = dict(my_profile)
    profile['avatar'] = url_for('static', filename='images/avatar.jpg')
    return profile

def load_posts():
    posts = []
    for filename in sorted(os.listdir(POSTS_DIR)):
        if filename.endswith(".md"):
            path = os.path.join(POSTS_DIR, filename)
            post = frontmatter.load(path)
            posts.append({
                "id": filename.replace(".md", ""),
                "title": post.get("title"),
                "date": post.get("date"),
                "summary": post.get("summary"),
                "tags": post.get("tags", []),
                "content": markdown.markdown(post.content, extensions=["fenced_code", "tables"])
            })
    return list(reversed(posts))  # 最新的文章在前

@app.route('/')
def home():
    profile = get_profile_with_avatar()
    posts = load_posts()
    return render_template('index.html', profile=profile, posts=posts)

@app.route('/post/<post_id>')
def post_detail(post_id):
    path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "posts", f"{post_id}.md")
    if not os.path.exists(path):
        return "文章不存在", 404

    post = frontmatter.load(path)
    content = markdown.markdown(post.content, extensions=["fenced_code", "tables"])

    return render_template('post.html', profile=get_profile_with_avatar(), post={
        "id": post_id,
        "title": post.get("title"),
        "date": post.get("date"),
        "summary": post.get("summary"),
        "tags": post.get("tags", []),
        "content": content
    })


if __name__ == '__main__':
    app.run(debug=True)