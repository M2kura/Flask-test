from flask import Flask, render_template, request, redirect, url_for
import plotly.express as px
import plotly
import json
import pandas as pd

# Create a Flask application instance
app = Flask(__name__)

# Sample data to simulate a database
todos = []

# Route for the home page
@app.route('/')
def home():
    df = px.data.iris()
    fig = px.scatter(df, x='sepal_width', y='sepal_length', color='species')
    graphJSON = json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder)

    return render_template('index.html', tasks=todos, graphJSON=graphJSON)

# Route to handle adding new tasks
@app.route('/add', methods=['POST'])
def add_task():
    task = request.form.get('task')
    if task:
        todos.append(task)
    return redirect(url_for('home'))

# Route with a variable parameter
@app.route('/delete/<int:task_id>')
def delete_task(task_id):
    if 0 <= task_id < len(todos):
        todos.pop(task_id)
    return redirect(url_for('home'))


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)