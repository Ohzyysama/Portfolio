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
        "title": "如何用 Flask 构建个人主页",
        "date": "2023-10-24",
        "summary": "这是我搭建这个网站的过程记录...",
        "tags": ["Python", "Web"],
        "content": "<p>这是第一段正文。</p><p>这里可以写很长很长的详细内容...</p>"
    },
    {
        "id": 2,
        "title": "理解 Python 的虚拟环境",
        "date": "2023-10-20",
        "summary": "为什么 pip install 老是报错？venv 到底是什么？",
        "tags": ["Python", "基础"],
        "content": "<p>虚拟环境是 Python 开发中非常重要的概念。</p><ul><li>隔离依赖</li><li>避免冲突</li></ul>"
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