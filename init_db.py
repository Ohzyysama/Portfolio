# init_db.py
from app import app, db   # 按你真实文件名改

with app.app_context():
    db.create_all()
    print("tables created")