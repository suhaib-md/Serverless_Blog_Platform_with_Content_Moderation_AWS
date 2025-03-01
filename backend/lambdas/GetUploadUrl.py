import json
import boto3
import os
import time

s3_client = boto3.client('s3')
bucket_name = os.environ['IMAGE_BUCKET']
codepipeline = boto3.client("codepipeline")

def report_pipeline_success(event):
    """ Reports success to CodePipeline """
    if "CodePipeline.job" in event:
        job_id = event["CodePipeline.job"]["id"]
        codepipeline.put_job_success_result(jobId=job_id)

def lambda_handler(event, context):
    try:
        query_params = event.get('queryStringParameters', {})
        file_name = query_params.get('fileName', f"image_{int(time.time())}.jpg")

        presigned_url = s3_client.generate_presigned_url(
            'put_object',
            Params={'Bucket': bucket_name, 'Key': f"uploads/{file_name}", 'ContentType': 'image/jpeg'},
            ExpiresIn=3600
        )

        report_pipeline_success(event)

        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',  
                'Access-Control-Allow-Methods': 'GET, OPTIONS',  
                'Access-Control-Allow-Headers': 'Content-Type'  
            },
            'body': json.dumps({'uploadUrl': presigned_url})
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': json.dumps({'error': str(e)})
        }
