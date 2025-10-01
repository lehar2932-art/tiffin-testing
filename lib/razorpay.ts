import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID! || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET! || "",
});

export default razorpay;

export const createRazorpayOrder = async (amount: number, currency = "INR") => {
  const options = {
    amount: amount * 100, // Amount in paise
    currency,
    receipt: `receipt_${Date.now()}`,
  };

  try {
    const order = await razorpay.orders.create(options);
    return order;
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    throw error;
  }
};

export const verifyRazorpayPayment = (
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
) => {
  const crypto = require("crypto");
  const body = razorpayOrderId + "|" + razorpayPaymentId;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(body.toString())
    .digest("hex");

  return expectedSignature === razorpaySignature;
};
