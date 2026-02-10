import os
from flask import Flask, render_template, url_for
from flask_sqlalchemy import SQLAlchemy
from flask import request, redirect
import markdown

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv(
    'DATABASE_URL',
    'sqlite:///blog.db'
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

class Post(db.Model):
    __tablename__ = 'posts'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    date = db.Column(db.String(20))
    summary = db.Column(db.Text)
    content = db.Column(db.Text)

    def __repr__(self):
        return f'<Post {self.title}>'

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
    post.content = markdown.markdown(
        post.content,
        extensions=['fenced_code', 'tables']
    )
    return render_template('post.html', profile=profile, post=post)


@app.route('/admin', methods=['GET', 'POST'])
def admin():
    profile = get_profile_with_avatar()

    if request.method == 'POST':
        title = request.form.get('title')
        date = request.form.get('date')
        summary = request.form.get('summary')
        content = request.form.get('content')

        if title and content:
            post = Post(
                title=title,
                date=date,
                summary=summary,
                content=content
            )
            db.session.add(post)
            db.session.commit()
            return redirect(url_for('home'))

    return render_template('admin.html', profile=profile)

if __name__ == '__main__':
    app.run(debug=True)
