import * as brevo from "@getbrevo/brevo";
import twilio from "twilio";

// Brevo Email Configuration
const brevoApiInstance = new brevo.TransactionalEmailsApi();
brevoApiInstance.setApiKey(
  brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY!
);

// Twilio SMS Configuration
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

export interface EmailData {
  to: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
}

export interface SMSData {
  to: string;
  message: string;
}

export const sendEmail = async (emailData: EmailData) => {
  try {
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.sender = {
      name: process.env.BREVO_SENDER_NAME!,
      email: process.env.BREVO_SENDER_EMAIL!,
    };
    sendSmtpEmail.to = [{ email: emailData.to }];
    sendSmtpEmail.subject = emailData.subject;
    sendSmtpEmail.htmlContent = emailData.htmlContent;
    sendSmtpEmail.textContent = emailData.textContent;

    const result = await brevoApiInstance.sendTransacEmail(sendSmtpEmail);
    return result;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

export const sendSMS = async (smsData: SMSData) => {
  try {
    const message = await twilioClient.messages.create({
      body: smsData.message,
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: smsData.to,
    });
    return message;
  } catch (error) {
    console.error("Error sending SMS:", error);
    throw error;
  }
};

// Email Templates
export const getOrderConfirmationEmail = (orderData: any) => ({
  subject: `Order Confirmation - ${orderData.orderId}`,
  htmlContent: `
    <h2>Order Confirmed!</h2>
    <p>Dear ${orderData.customerName},</p>
    <p>Your order has been confirmed with ${orderData.providerName}.</p>
    <p><strong>Order ID:</strong> ${orderData.orderId}</p>
    <p><strong>Total Amount:</strong> ₹${orderData.totalAmount}</p>
    <p><strong>Delivery Date:</strong> ${orderData.deliveryDate}</p>
    <p>You can track your order status in your dashboard.</p>
    <p>Thank you for choosing TiffinHub!</p>
  `,
  textContent: `Order Confirmed! Your order ${orderData.orderId} has been confirmed with ${orderData.providerName}. Total: ₹${orderData.totalAmount}. Delivery: ${orderData.deliveryDate}.`,
});

export const getOrderStatusUpdateEmail = (orderData: any) => ({
  subject: `Order Status Update - ${orderData.orderId}`,
  htmlContent: `
    <h2>Order Status Updated</h2>
    <p>Dear ${orderData.customerName},</p>
    <p>Your order status has been updated to: <strong>${orderData.status}</strong></p>
    <p><strong>Order ID:</strong> ${orderData.orderId}</p>
    <p><strong>Provider:</strong> ${orderData.providerName}</p>
    <p>Track your order in your dashboard for more details.</p>
    <p>Thank you for choosing TiffinHub!</p>
  `,
  textContent: `Order Status Update: Your order ${orderData.orderId} status is now ${orderData.status}.`,
});

// SMS Templates
export const getOrderConfirmationSMS = (orderData: any) =>
  `TiffinHub: Order ${orderData.orderId} confirmed! Total: ₹${orderData.totalAmount}. Delivery: ${orderData.deliveryDate}. Track in app.`;

export const getOrderStatusUpdateSMS = (orderData: any) =>
  `TiffinHub: Order ${orderData.orderId} status updated to ${orderData.status}. Check app for details.`;
