import { Injectable } from '@nestjs/common';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';

@Injectable()
export class EmailService {
  private lambdaClient: LambdaClient;
  private readonly lambdaFunctionName: string;

  constructor() {
    this.lambdaClient = new LambdaClient({
      region: process.env.AWS_REGION || 'us-east-1',
    });
    this.lambdaFunctionName =
      process.env.EMAIL_LAMBDA_FUNCTION_NAME || 'send-email-function';
  }

  /**
   * Send an email to multiple recipients
   * @param recipients Array of email addresses
   * @param subject Email subject
   * @param htmlBody HTML content of the email
   * @param textBody Plain text content of the email
   * @param from Optional sender email address
   * @returns Promise with the Lambda function response
   */
  async sendEmail(
    recipients: string[],
    subject: string,
    htmlBody: string,
    textBody?: string,
    from?: string,
  ): Promise<any> {
    try {
      const payload = {
        recipients,
        subject,
        htmlBody,
        textBody,
        from,
      };

      const command = new InvokeCommand({
        FunctionName: this.lambdaFunctionName,
        Payload: Buffer.from(JSON.stringify(payload)),
      });

      const response = await this.lambdaClient.send(command);

      console.log('Lambda response:', response);
      
      if (response.StatusCode !== 200) {
        throw new Error(`Lambda invocation failed with status code: ${response.StatusCode}`);
      }

      const responsePayload = response.Payload 
        ? JSON.parse(Buffer.from(response.Payload).toString())
        : null;

      if (responsePayload && responsePayload.statusCode !== 200) {
        throw new Error(responsePayload.body ? JSON.parse(responsePayload.body).message : 'Email sending failed');
      }

      return responsePayload;
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  /**
   * Send a team invitation email
   * @param recipients Array of email addresses
   * @param teamName Name of the team
   * @param inviterName Name of the person who sent the invitation
   * @returns Promise with the Lambda function response
   */
  async sendTeamInvitation(
    recipients: string[],
    teamName: string,
    inviterName: string,
  ): Promise<any> {
    const subject = `Invitation to join ${teamName}`;
    const htmlBody = `
      <h2>You've been invited to join ${teamName}</h2>
      <p>${inviterName} has invited you to join their team on Task Management App.</p>
      <p>Log in to your account to accept or reject this invitation.</p>
    `;
    const textBody = `
      You've been invited to join ${teamName}
      
      ${inviterName} has invited you to join their team on Task Management App.
      
      Log in to your account to accept or reject this invitation.
    `;

    return this.sendEmail(recipients, subject, htmlBody, textBody);
  }
}
