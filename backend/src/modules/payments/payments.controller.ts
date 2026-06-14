import { Request, Response } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';

export class PaymentsController {
  private getRazorpay(): Razorpay {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    
    if (!key_id || !key_secret) {
      throw new Error('Razorpay keys are not configured properly');
    }

    return new Razorpay({
      key_id,
      key_secret,
    });
  }

  createOrder = async (req: Request, res: Response) => {
    try {
      const { amount } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'Valid amount is required' });
      }

      // Convert amount to paise (multiply by 100)
      const options = {
        amount: Math.round(amount * 100),
        currency: 'INR',
        receipt: `rcpt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      };

      const rzp = this.getRazorpay();
      const order = await rzp.orders.create(options);
      
      return res.status(200).json({ id: order.id, currency: order.currency, amount: order.amount });
    } catch (error: any) {
      console.error('Razorpay Create Order Error:', error);
      return res.status(500).json({ error: error.message || 'Failed to create Razorpay order' });
    }
  };

  verifyPayment = async (req: Request, res: Response) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({ error: 'Missing required Razorpay parameters' });
      }

      const secret = process.env.RAZORPAY_KEY_SECRET || '';

      // Create HMAC SHA256 signature
      const generated_signature = crypto
        .createHmac('sha256', secret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (generated_signature === razorpay_signature) {
        // Payment is successfully verified
        // TODO: Update order status in the database to 'PAID'
        return res.status(200).json({ success: true, message: 'Payment verified successfully' });
      } else {
        return res.status(400).json({ success: false, error: 'Payment signature verification failed' });
      }
    } catch (error: any) {
      console.error('Razorpay Verify Payment Error:', error);
      return res.status(500).json({ error: error.message || 'Failed to verify payment' });
    }
  };
}
