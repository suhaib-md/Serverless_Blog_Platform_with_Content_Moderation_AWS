import json
import boto3
import os

# Initialize AWS clients
rekognition = boto3.client("rekognition")
s3 = boto3.client("s3")
sns = boto3.client("sns")

# Environment variables
sns_topic_arn = os.environ["SNS_TOPIC_ARN"]  # Ensure this is set in Lambda environment variables

def lambda_handler(event, context):
    print("Received event:", json.dumps(event, indent=2))

    for record in event["Records"]:
        bucket_name = record["s3"]["bucket"]["name"]
        object_key = record["s3"]["object"]["key"]

        print(f"Processing image: s3://{bucket_name}/{object_key}")

        try:
            # 🔹 Run Rekognition moderation
            response = rekognition.detect_moderation_labels(
                Image={"S3Object": {"Bucket": bucket_name, "Name": object_key}},
                MinConfidence=75
            )

            if response["ModerationLabels"]:  # If flagged
                labels = [label["Name"] for label in response["ModerationLabels"]]
                print("Image flagged for:", labels)

                # Send SNS Alert
                sns.publish(
                    TopicArn=sns_topic_arn,
                    Message=f"⚠️ Manually uploaded image flagged for {', '.join(labels)}.\nImage: s3://{bucket_name}/{object_key}",
                    Subject="⚠️ Manual Upload Image Moderation Alert"
                )

                # 🔹 Delete the flagged image from S3
                s3.delete_object(Bucket=bucket_name, Key=object_key)
                print(f"Deleted flagged image: s3://{bucket_name}/{object_key}")

        except Exception as e:
            print("Error processing image:", str(e))

    return {"statusCode": 200, "body": "Moderation process completed"}
