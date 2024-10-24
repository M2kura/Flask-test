from flask import Flask, render_template
import plotly.express as px
import plotly
import json

app = Flask(__name__)

@app.route('/')
def index():
    # Generate a Plotly graph
    df = px.data.iris()
    fig = px.scatter(df, x='sepal_width', y='sepal_length', color='species')
    graphJSON = json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder)
    
    return render_template('index.html', graphJSON=graphJSON)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)