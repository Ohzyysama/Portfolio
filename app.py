from flask import Flask, render_template, url_for

app = Flask(__name__)

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
posts =  [
    {
        "id": 1,
        "title": "我的个人主页开张啦(附教程)",
        "date": "2026-2-10",
        "summary": "这是我搭建这个网站的过程记录...",
        "tags": ["Python", "Web"],
        "content": "<p>网站的技术栈采用python + flask进行构建，部署在vercel服务器上（免费）。</p>"
        "<p><strong>快速开始</strong></p>"
        "<p>1.准备项目</p><p>2.将项目推送至GitHub</p><p>3.使用GitHub账号注册vercel并部署项目</p>"
    }
]

def get_profile_with_avatar():
    # 复制一份数据，避免修改全局变量
    profile = dict(my_profile)
    # 在这里动态生成头像路径
    profile['avatar'] = url_for('static', filename='images/avatar.jpg')
    return profile

@app.route('/')
def home():
    profile = get_profile_with_avatar()
    return render_template('index.html', profile=profile, posts=posts)

@app.route('/post/<int:post_id>')
def post_detail(post_id):
    profile = get_profile_with_avatar()
    
    post = next((p for p in posts if p['id'] == post_id), None)
    
    if post is None:
        return "文章不存在", 404
        
    return render_template('post.html', profile=profile, post=post)

if __name__ == '__main__':
    app.run(debug=True)