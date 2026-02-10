from app import app, db, Post

# --- 这里填你要删除的文章 ID ---
post_id_to_delete = 1  

with app.app_context():
    # 1. 根据 ID 查找文章
    post = Post.query.get(post_id_to_delete)
    
    if post:
        # 2. 如果找到了，就删除
        db.session.delete(post)
        db.session.commit()
        print(f"成功删除文章：ID {post_id_to_delete} - 《{post.title}》")
    else:
        print(f"未找到 ID 为 {post_id_to_delete} 的文章，可能已经被删除了。")