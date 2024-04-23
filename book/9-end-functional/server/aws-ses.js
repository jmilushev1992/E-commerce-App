const aws = require('aws-sdk');

// Function to send email using AWS SES
function sendEmail(options) {
  // Create a new SES object
  const ses = new aws.SES({
    apiVersion: 'latest',
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESSKEYID,
    secretAccessKey: process.env.AWS_SECRETACCESSKEY,
  });

  // Return a promise to send email
  return new Promise((resolve, reject) => {
    ses.sendEmail(
      {
        Source: options.from, // Sender email address
        Destination: {
          ToAddresses: options.to, // Recipient email address(es)
        },
        Message: {
          Subject: {
            Data: options.subject, // Email subject
          },
          Body: {
            Html: {
              Data: options.body, // HTML content of the email
            },
          },
        },
        ReplyToAddresses: options.replyTo, // Reply-to email address(es)
      },
      // Callback function to handle the result of sending email
      (err, info) => {
        if (err) {
          reject(err); // Reject the promise if there's an error
        } else {
          resolve(info); // Resolve the promise with the information if email is sent successfully
        }
      },
    );
  });
}

// Export the sendEmail function
module.exports = sendEmail;
