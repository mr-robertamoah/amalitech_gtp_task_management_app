# Notification Lambda Function

This Lambda function checks for task notifications due today in DynamoDB and sends email reminders via the email-lambda function.

## Setup

1. Create a `.env` file based on `.env.example` with your AWS configuration:
   ```
   AWS_REGION=us-east-1
   DYNAMO_TABLE_NAME=your-dynamodb-table-name
   EMAIL_LAMBDA_FUNCTION_NAME=send-email-function
   DEFAULT_FROM_EMAIL=noreply@yourdomain.com
   LAMBDA_ROLE_ARN=arn:aws:iam::123456789012:role/lambda-execution-role
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Deploy the function:
   ```
   npm run deploy
   ```

## How It Works

1. The function is triggered daily by an EventBridge (CloudWatch Events) rule.
2. It queries DynamoDB for task notifications that are due today and haven't been sent yet.
3. For each notification, it invokes the email-lambda function to send an email reminder.
4. After sending the email, it marks the notification as sent in DynamoDB.

## Environment Variables

- `THE_AWS_REGION`: AWS region where your resources are located
- `DYNAMO_TABLE_NAME`: Name of your DynamoDB table
- `EMAIL_LAMBDA_FUNCTION_NAME`: Name of your email Lambda function
- `DEFAULT_FROM_EMAIL`: Default sender email address
- `LAMBDA_ROLE_ARN`: ARN of the IAM role for Lambda execution

## IAM Permissions

The Lambda function requires the following permissions:
- `dynamodb:Query` - To query notifications from DynamoDB
- `dynamodb:UpdateItem` - To mark notifications as sent
- `lambda:InvokeFunction` - To invoke the email-lambda function

## EventBridge Rule

The deployment script creates an EventBridge rule that triggers the function daily at 8:00 AM UTC. You can modify the cron expression in the deploy.sh script to change the schedule.