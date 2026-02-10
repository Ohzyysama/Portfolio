from app import app, db, Post

# 这里填写你要添加的新文章内容
new_article = {
    "title": "网站连接数据库测试文章",
    "date": "2026-02-10",
    "summary": "测试用",
    "content": "<p>如果你看到这篇文章，说明数据库写入成功了！</p><p>Vercel 部署后也能看到。</p>",
    "tags_str": "测试"
}

# 执行写入
with app.app_context():
    post = Post(
        title=new_article['title'],
        date=new_article['date'],
        summary=new_article['summary'],
        content=new_article['content'],
        tags_str=new_article['tags_str']
    )
    db.session.add(post)
    db.session.commit()
    print(f"成功添加文章：《{new_article['title']}》")