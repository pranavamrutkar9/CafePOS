import nodemailer from 'nodemailer';

const quotes = [
  "Believe you can and you're halfway there. - Theodore Roosevelt",
  "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill",
  "The only way to do great work is to love what you do. - Steve Jobs",
  "You are never too old to set another goal or to dream a new dream. - C.S. Lewis",
  "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
  "It always seems impossible until it's done. - Nelson Mandela",
  "Keep your face always toward the sunshine—and shadows will fall behind you. - Walt Whitman",
  "Opportunities don't happen, you create them. - Chris Grosser"
];

// Reusable transporter (configure these in your .env file for production)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587'),
  auth: {
    user: process.env.SMTP_USER || 'ethereal.user@ethereal.email',
    pass: process.env.SMTP_PASS || 'ethereal_password'
  }
});

export async function sendThankYouEmail(to: string, customerName: string): Promise<boolean> {
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  
  const htmlBody = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #E5E7EB; border-radius: 12px; background-color: #ffffff;">
      <h2 style="color: #4F46E5; font-size: 24px; margin-bottom: 10px;">Thank You, ${customerName}! ✨</h2>
      <p style="font-size: 16px; color: #374151; line-height: 1.5;">Your payment was successfully processed. We truly appreciate your business and hope you had a wonderful experience at CafePOS.</p>
      
      <div style="margin-top: 35px; margin-bottom: 35px; padding: 25px; background-color: #F3F4F6; border-left: 5px solid #4F46E5; border-radius: 8px;">
        <p style="font-size: 18px; font-style: italic; color: #1F2937; margin: 0; line-height: 1.4;">"${randomQuote}"</p>
      </div>
      
      <p style="font-size: 14px; color: #6B7280; margin-top: 30px; border-top: 1px solid #E5E7EB; padding-top: 20px;">
        See you again soon!<br/>
        <strong>- The CafePOS Team</strong>
      </p>
    </div>
  `;

  try {
    // If SMTP_HOST is not set, we just simulate it to avoid crashing the server
    if (!process.env.SMTP_HOST) {
      console.log(`\n============================`);
      console.log(`[SIMULATED EMAIL SENT TO: ${to}]`);
      console.log(`Subject: Thank you for your purchase! ☕`);
      console.log(`Quote included: "${randomQuote}"`);
      console.log(`============================\n`);
      return true;
    }
    
    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"CafePOS" <noreply@cafepos.com>',
      to,
      subject: 'Thank you for your purchase! ☕',
      html: htmlBody,
    });
    console.log(`Thank you email successfully sent to ${to}`);
    return true;
  } catch (error) {
    console.error('Failed to send thank you email:', error);
    return false;
  }
}
