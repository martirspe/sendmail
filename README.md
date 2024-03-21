# SendMail API

SendMail API is a lightweight Node.js application developed using Express.js and Nodemailer to facilitate the efficient sending of emails. This API provides a simple and straightforward interface for integrating email sending capabilities into your Node.js projects.

## Features

- **Easy Integration:** Seamlessly integrate email sending functionality into your Node.js applications.
- **Fast and Reliable:** Built using Node.js and Nodemailer, ensuring fast and reliable email delivery.
- **Customizable:** Customize email content, recipients, and other parameters to suit your specific requirements.
- **Express.js Powered:** Utilizes Express.js for handling HTTP requests, providing a robust and scalable API framework.

## Getting Started

To get started with SendMail API, follow the steps below:

### Step 1: Clone the Repository

```bash
git clone <repository-url>
```

### Step 2: Install Dependencies

```bash
cd sendmail-api
npm install
```

### Step 3: Configure Environment Variables

Create a `.env` file in the root directory of the project and add the following environment variables:

```plaintext
API_PORT=9114
API_ROUTE=sendmail
EMAIL_HOST=mail.domain.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=user@domain.com
EMAIL_PASSWORD=''
```

Make sure to replace `mail.domain.com`, `user@domain.com`, and `EMAIL_PASSWORD` with the appropriate values for your mail server.

### Step 4: Start the Server

```bash
npm start
```

### Step 5: Test the API with Postman

1. Open Postman.
2. Select the POST method.
3. Enter the endpoint URL: `http://localhost:9114/sendmail`.
4. Set the content type to `application/json`.
5. In the request body (Body > RAW), enter the following JSON:

```json
{
    "from": "user@domain.com",
    "to": "user@domain.com",
    "subject": "Mail from NodeJS API",
    "html": "NodeJS API test message."
}
```

Make sure to replace `user@domain.com` with the appropriate values for sending mail.

6. Click the "Send" button to send the request.

### Step 6: Verify Results

Verify that you receive the email at the address specified in the "to" field of the JSON request.

That's it! You have successfully tested the SendMail API and sent an email using the API. If you encounter any issues during the process, make sure to check the configuration of environment variables and the details of the request.