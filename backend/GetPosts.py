import json
import boto3
import os
from decimal import Decimal

# Initialize DynamoDB
dynamodb = boto3.resource("dynamodb")
table_name = os.environ["BLOG_TABLE"]
table = dynamodb.Table(table_name)

# 🔹 Custom JSON Encoder for Decimal values
class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)  # ✅ Convert Decimal to float
        return super(DecimalEncoder, self).default(obj)

def lambda_handler(event, context):
    try:
        posts = []
        response = table.scan()

        # Handle pagination in case there are more items
        while "LastEvaluatedKey" in response:
            posts.extend(response.get("Items", []))  # Add current items to list
            response = table.scan(ExclusiveStartKey=response["LastEvaluatedKey"])

        posts.extend(response.get("Items", []))  # Add the last batch of items

        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",  # Allow CORS for all domains
                "Access-Control-Allow-Methods": "GET",
                "Access-Control-Allow-Headers": "Content-Type",
            },
            "body": json.dumps(posts, cls=DecimalEncoder),  # ✅ Use custom encoder
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "headers": {
                "Access-Control-Allow-Origin": "*"
            },
            "body": json.dumps({"error": str(e)}, cls=DecimalEncoder),  # ✅ Use encoder for error response
        }
