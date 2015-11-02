from flask import g, jsonify, render_template


def index():
    return render_template('index.html')
