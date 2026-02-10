from app import app, db, Post

with app.app_context():
    post = Post(
        title="我的个人主页开张啦(附教程)",
        date="2026-2-10",
        summary="这是我搭建这个网站的过程记录...",
        content="""
        <p>网站的技术栈采用 python + flask 进行构建，部署在 vercel 服务器上（免费）。</p>
        <p><strong>快速开始</strong></p>
        <p>1.准备项目</p>
        <p>2.将项目推送至 GitHub</p>
        <p>3.使用 GitHub 账号注册 vercel 并部署项目</p>
        """
    )
    db.session.add(post)
    db.session.commit()
