# Email Lambda Function

This Lambda function sends emails using Nodemailer with Gmail.

## Setup Instructions

1. Install dependencies:
   ```
   npm install
   ```

2. Create a Gmail App Password:
   - Go to your Google Account settings
   - Navigate to Security > 2-Step Verification
   - Scroll down and click on "App passwords"
   - Create a new app password for "Mail" and your application

3. Configure environment variables in AWS Lambda:
   - `EMAIL_USER`: Your Gmail address
   - `EMAIL_APP_PASSWORD`: Your Gmail app password
   - `DEFAULT_FROM_EMAIL`: Default sender email address

4. Deploy to AWS Lambda:
   ```
   npm run zip
   ```
   Then upload the generated `function.zip` to AWS Lambda.

5. Configure Lambda settings:
   - Set timeout to at least 10 seconds
   - Allocate at least 128MB of memory

## Usage

Invoke the Lambda function with the following event structure:

```json
{
  "recipients": ["recipient1@example.com", "recipient2@example.com"],
  "subject": "Your email subject",
  "htmlBody": "<p>HTML version of your email</p>",
  "textBody": "Plain text version of your email",
  "from": "optional-custom-sender@example.com"
}
```

The function will send individual emails to each recipient without exposing other recipients' addresses.