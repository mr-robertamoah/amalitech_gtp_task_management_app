const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { LambdaClient, InvokeCommand } = require('@aws-sdk/client-lambda');

// Initialize DynamoDB client
const dynamoClient = new DynamoDBClient({ region: process.env.THE_AWS_REGION || 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

// Initialize Lambda client
const lambdaClient = new LambdaClient({ region: process.env.THE_AWS_REGION || 'us-east-1' });

/**
 * Lambda function that checks for notifications due today and sends them via email-lambda
 */
exports.handler = async (event) => {
  try {
    console.log('Starting daily notification check');
    
    // Get today's date in ISO format (YYYY-MM-DD)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];
    
    console.log(`Checking for notifications due on ${todayStr}`);
    
    // Query DynamoDB for notifications due today that haven't been sent yet
    const queryResult = await docClient.send(
      new ScanCommand({
        TableName: process.env.DYNAMO_TABLE_NAME,
        FilterExpression: 'begins_with(PK, :pk) AND begins_with(endAt, :today) AND notified = :notified',
        ExpressionAttributeValues: {
          ':pk': 'NOTIFICATION#',
          ':today': todayStr,
          ':notified': false,
        },
      })
    );
    
    const notifications = queryResult.Items || [];
    console.log(`Found ${notifications.length} notifications to send`);
    
    if (notifications.length === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: 'No notifications to send today',
        }),
      };
    }
    
    // Process each notification
    for (const notification of notifications) {
      try {
        // Prepare email payload
        const emailPayload = {
          recipients: [notification.assigneeEmail],
          subject: `Task Deadline Reminder: ${notification.taskTitle}`,
          htmlBody: `
            <h2>Task Deadline Reminder</h2>
            <p>This is a reminder that your task "${notification.taskTitle}" is due today.</p>
            <p>Please log in to the Task Management App to update your progress.</p>
          `,
          textBody: `Task Deadline Reminder: Your task "${notification.taskTitle}" is due today. Please log in to the Task Management App to update your progress.`,
          from: notification.assignerEmail || process.env.DEFAULT_FROM_EMAIL,
        };
        
        // Invoke email-lambda to send the notification
        const command = new InvokeCommand({
          FunctionName: process.env.EMAIL_LAMBDA_FUNCTION_NAME || 'send-email-function',
          Payload: Buffer.from(JSON.stringify(emailPayload)),
        });
        
        const response = await lambdaClient.send(command);
        
        if (response.StatusCode !== 200) {
          throw new Error(`Email lambda invocation failed with status code: ${response.StatusCode}`);
        }
        
        // Mark notification as sent
        await docClient.send(
          new UpdateCommand({
            TableName: process.env.DYNAMO_TABLE_NAME,
            Key: {
              PK: notification.PK,
              SK: notification.SK
            },
            UpdateExpression: 'SET notified = :notified',
            ExpressionAttributeValues: {
              ':notified': true
            }
          })
        );
        
        console.log(`Successfully sent notification for task ${notification.taskId}`);
      } catch (notificationError) {
        console.error(`Error processing notification ${notification.taskId}:`, notificationError);
        // Continue with other notifications even if one fails
      }
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Successfully processed ${notifications.length} notifications`,
      }),
    };
  } catch (error) {
    console.error('Error in notification lambda:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Failed to process notifications',
        error: error.message,
      }),
    };
  }
};