"""
GitPusher MVP Test Application
A simple Flask API for testing the GitPusher workflow.
"""
from flask import Flask, jsonify, request

app = Flask(__name__)

@app.route('/')
def home():
    return jsonify({
        "service": "GitPusher MVP Test",
        "version": "1.0.0",
        "status": "running"
    })

@app.route('/api/hello')
def hello():
    name = request.args.get('name', 'World')
    return jsonify({"message": f"Hello, {name}!"})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
