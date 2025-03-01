import json
import boto3
import uuid
import time
import os
from decimal import Decimal
from botocore.exceptions import ClientError

# Initialize AWS services
dynamodb = boto3.resource("dynamodb")
rekognition = boto3.client("rekognition")
s3 = boto3.client("s3")
sns = boto3.client("sns")

# Environment variables
table_name = os.environ['BLOG_TABLE']
table = dynamodb.Table(table_name)
sns_topic_arn = os.environ["SNS_TOPIC_ARN"]  # Ensure this is set in Lambda environment variables

# Custom JSON Encoder for handling Decimal values
class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super(DecimalEncoder, self).default(obj)

def lambda_handler(event, context):
    print("Received event:", json.dumps(event, indent=2))

    try:
        # Parse the request body
        if "body" in event:
            body = json.loads(event["body"])
        else:
            body = event
        
        title = body.get("title")
        content = body.get("content")
        image_url = body.get("imageUrl")
        
        if not title or not content or not image_url:
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "Missing required fields"}, cls=DecimalEncoder)
            }
        
        # Extract bucket name and object key from image_url
        bucket_name = image_url.split("/")[2].split(".")[0]  # Extract bucket name
        object_key = "/".join(image_url.split("/")[3:])  # Extract object key

        # 🔹 Moderate the image using Rekognition
        response = rekognition.detect_moderation_labels(
            Image={"S3Object": {"Bucket": bucket_name, "Name": object_key}},
            MinConfidence=75  # Confidence threshold for moderation
        )

        if response["ModerationLabels"]:  # If image is flagged
            labels = [label["Name"] for label in response["ModerationLabels"]]
            print("Image flagged for:", labels)

            # Send an SNS warning
            sns.publish(
                TopicArn=sns_topic_arn,
                Message=f"⚠️ Warning: Image flagged for {', '.join(labels)}.\nImage URL: {image_url}",
                Subject="⚠️ Image Moderation Alert"
            )

            # 🔹 Delete the flagged image from S3
            s3.delete_object(Bucket=bucket_name, Key=object_key)
            print(f"Flagged image {object_key} deleted from S3")

            # Return an error message to the browser
            return {
                "statusCode": 400,
                "body": json.dumps({
                    "error": f"Your image was flagged for {', '.join(labels)}. The post was rejected.",
                    "warning": "Do not upload inappropriate content!"
                })
            }

        # ✅ Image is safe → Save post in DynamoDB
        post_id = str(uuid.uuid4())
        table.put_item(
            Item={
                "PostID": post_id,
                "title": title,
                "content": content,
                "imageUrl": image_url,
                "createdAt": int(time.time())
            }
        )

        return {
            "statusCode": 200,
            "body": json.dumps({"message": "Post created successfully!", "postId": post_id}, cls=DecimalEncoder)
        }

    except ClientError as e:
        print("AWS Error:", str(e))
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)}, cls=DecimalEncoder)
        }

    except Exception as e:
        print("Error:", str(e))
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)}, cls=DecimalEncoder)
        }
