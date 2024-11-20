from flask import Flask, render_template, jsonify, send_from_directory
import boto3
import os

app = Flask(__name__)

s3_client = boto3.client(
    's3',
    aws_access_key_id = "",
    aws_secret_access_key = "",
    region_name = ""
)

bucket_name = "cz-demo"

def crop_to_last_slash(s, file):
    last_slash_index = s.rfind('/')
    if last_slash_index != -1:
        return s[last_slash_index + (1 if file else 0):]
    return s

def get_file_structure(prefix=''):
    response = s3_client.list_objects_v2(Bucket=bucket_name, Prefix=prefix, Delimiter='/')
    structure = {}
    for common_prefix in response.get('CommonPrefixes', []):
        sub_prefix = common_prefix['Prefix']
        structure[sub_prefix] = get_file_structure(sub_prefix)
    for content in response.get('Contents', []):
        if content['Key'] != prefix:
            key = content['Key'];
            structure[crop_to_last_slash(key, True)] = None
    return structure

@app.route('/')
def index():
    return render_template("index.html", bucket_name=bucket_name)

@app.route('/file_structure')
def file_structure():
    file_structure = get_file_structure()
    return jsonify(file_structure)

@app.route('/file/<file_name>')
def animal(file_name):
    try:
        s3_object = s3_client.get_object(Bucket="cz-demo", Key=f"ht_demo/{file_name}")
        html_content = s3_object['Body'].read()
        # print(html_content)
        return html_content
    except Exception as e:
        return str(e), 404

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)