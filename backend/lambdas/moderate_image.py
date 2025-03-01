import json
import boto3
import os

# Initialize AWS clients
rekognition = boto3.client("rekognition")
s3 = boto3.client("s3")
sns = boto3.client("sns")
codepipeline = boto3.client("codepipeline")

# Environment variables
sns_topic_arn = os.environ.get("SNS_TOPIC_ARN")  # Use `.get()` to prevent KeyError

def report_pipeline_success(event):
    """ Reports success to CodePipeline """
    if "CodePipeline.job" in event:
        job_id = event["CodePipeline.job"]["id"]
        codepipeline.put_job_success_result(jobId=job_id)

def lambda_handler(event, context):
    print("Received event:", json.dumps(event, indent=2))

    # ✅ Validate event structure
    if "Records" not in event:
        print("⚠️ Warning: No 'Records' key found in event. Possibly triggered manually.")
        return {
            "statusCode": 400,
            "body": json.dumps({"error": "Invalid event format. No 'Records' found."})
        }

    for record in event["Records"]:
        try:
            bucket_name = record["s3"]["bucket"]["name"]
            object_key = record["s3"]["object"]["key"]

            print(f"Processing image: s3://{bucket_name}/{object_key}")

            # 🔹 Run Rekognition moderation
            response = rekognition.detect_moderation_labels(
                Image={"S3Object": {"Bucket": bucket_name, "Name": object_key}},
                MinConfidence=75
            )

            if response.get("ModerationLabels"):  # If flagged
                labels = [label["Name"] for label in response["ModerationLabels"]]
                print("Image flagged for:", labels)

                # Send SNS Alert
                if sns_topic_arn:
                    sns.publish(
                        TopicArn=sns_topic_arn,
                        Message=f"⚠️ Manually uploaded image flagged for {', '.join(labels)}.\nImage: s3://{bucket_name}/{object_key}",
                        Subject="⚠️ Manual Upload Image Moderation Alert"
                    )

                # 🔹 Delete the flagged image from S3
                s3.delete_object(Bucket=bucket_name, Key=object_key)
                print(f"Deleted flagged image: s3://{bucket_name}/{object_key}")

        except KeyError as ke:
            print(f"❌ KeyError: Missing expected key in event record: {ke}")
        except Exception as e:
            print(f"❌ Error processing image: {e}")

    # ✅ Move outside the loop (to be executed once per event)
    report_pipeline_success(event)

    return {"statusCode": 200, "body": json.dumps({"message": "Moderation process completed"})}
