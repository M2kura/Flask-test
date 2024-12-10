from flask import Flask, render_template, jsonify, request, send_file
import boto3
import os
from io import BytesIO

app = Flask(__name__)

s3_client = boto3.client(
    's3',
    aws_access_key_id = "",
    aws_secret_access_key = "",
    region_name = ""
)

bucket_name = "cz-demo"
folder_name = "60-reporting/"

#Function for fetching the file tree in JSON
def get_file_structure(prefix=''):
    response = s3_client.list_objects_v2(Bucket=bucket_name, Prefix=prefix, Delimiter='/')
    structure = {}
    base_prefix_length = len(prefix)
    
    for common_prefix in response.get('CommonPrefixes', []):
        sub_prefix = common_prefix['Prefix']
        folder_name = sub_prefix[base_prefix_length:]
        structure[folder_name] = get_file_structure(sub_prefix)
    
    for content in response.get('Contents', []):
        if content['Key'] != prefix:
            key = content['Key']
            file_name = key[base_prefix_length:].strip('/')
            structure[file_name] = None
    
    return structure

@app.route('/')
def index():
    return render_template("index.html")

@app.route('/file_structure')
def file_structure():
    file_structure = get_file_structure(folder_name)
    return jsonify(file_structure)

@app.route('/download', methods=['GET'])
def download_file():
    key = request.args.get('key')
    if not key:
        return jsonify({"error": "Missing key"}), 400

    file_name = key.rsplit('/', 1)[-1]
    local_path = f"/tmp/{file_name}"

    try:
        s3_client.download_file(bucket_name, folder_name + key, local_path)
        return send_file(local_path, as_attachment=True)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        if os.path.exists(local_path):
            os.remove(local_path)

@app.route('/show', methods=['GET'])
def show():
    key = request.args.get('key')
    if not key:
        return jsonify({"error": "Missing key"}), 400
    try:
        s3_object = s3_client.get_object(Bucket=bucket_name, Key=folder_name+key)
        html_content = s3_object['Body'].read()
        return html_content
    except Exception as e:
        return str(e), 404

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
