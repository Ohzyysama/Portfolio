import os
from flask import Flask, render_template, url_for
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)

# --- 数据库配置 ---
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'blog.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# --- 定义数据库模型 ---
class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    date = db.Column(db.String(20), nullable=False)
    summary = db.Column(db.String(200))
    content = db.Column(db.Text, nullable=False)
    tags_str = db.Column(db.String(100)) 

    @property
    def tags(self):
        if self.tags_str:
            return self.tags_str.split(',')
        return []

my_profile = {
    "name": "Chou",
    "title": "NJU Software Engineering Drudge",
    "bio": "努力生活中...",
    "email" : "231250040@smail.nju.edu.cn",
    "social_links": [
        {"name": "GitHub", "url": "https://github.com/Ohzyysama"},
        {"name": "Gitee", "url" : "https://gitee.com/ohzyysama"}
    ]
}

def get_profile_with_avatar():
    profile = dict(my_profile)
    profile['avatar'] = url_for('static', filename='images/avatar.jpg')
    return profile


@app.route('/')
def home():
    profile = get_profile_with_avatar()
    posts = Post.query.order_by(Post.id.desc()).all()
    return render_template('index.html', profile=profile, posts=posts)

@app.route('/post/<int:post_id>')
def post_detail(post_id):
    profile = get_profile_with_avatar()
    
    post = Post.query.get_or_404(post_id)
        
    return render_template('post.html', profile=profile, post=post)

if __name__ == '__main__':
    with app.app_context():
        # 1. 创建数据库表（如果不存在的话）
        db.create_all()
        
        # 2. 检查数据库是否为空，如果为空，写入你原来的那篇文章
        if Post.query.count() == 0:
            print("检测到数据库为空，正在写入初始文章...")
            initial_post = Post(
                title="我的个人主页开张啦(附教程)",
                date="2026-2-10",
                summary="这是我搭建这个网站的过程记录...",
                # 注意：数据库存储标签使用逗号分隔的字符串
                tags_str="Python,Web", 
                content=(
                    "<p>网站的技术栈采用python + flask进行构建，部署在vercel服务器上（免费）。</p>"
                    "<p><strong>快速开始</strong></p>"
                    "<p>1.准备项目</p><p>2.将项目推送至GitHub</p><p>3.使用GitHub账号注册vercel并部署项目</p>"
                )
            )
            db.session.add(initial_post)
            db.session.commit()
            print("初始文章写入完成！")

    app.run(debug=True)