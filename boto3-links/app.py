from flask import Flask, render_template, render_template_string, send_from_directory, Markup
import boto3
import os

app = Flask(__name__)

s3_client = boto3.client(
    's3',
    aws_access_key_id = "",
    aws_secret_access_key = "",
    region_name = ""
)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/<animal_name>')
def animal(animal_name):
    try:
        s3_object = s3_client.get_object(Bucket="cz-demo", Key=f"ht_demo/{animal_name}.html")
        html_content = s3_object['Body'].read()
        # print(html_content)
        return html_content
    except Exception as e:
        return str(e), 404

@app.route('/list_buckets')
def list_buckets():
    try:
        response = s3_client.list_buckets()
        buckets = [bucket['Name'] for bucket in response['Buckets']]
        return render_template_string(f"<h1>Buckets</h1><ul>{''.join([f'<li>{bucket}</li>' for bucket in buckets])}</ul>")
    except Exception as e:
        return str(e), 404

@app.route('/file')
def file():
    try:
        bucket_name = "cz-demo"
        key = "ht_demo/structure_report_pvzp_2024_07.html"
        local_filename = "downloads/structure_report_pvzp_2024_07.html"

        # Ensure the downloads directory exists
        os.makedirs(os.path.dirname(local_filename), exist_ok=True)

        # Download the file from S3
        s3_client.download_file(bucket_name, key, local_filename)

        # Serve the downloaded file
        return send_from_directory('downloads', "structure_report_pvzp_2024_07.html")
    except Exception as e:
        return str(e), 404

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)