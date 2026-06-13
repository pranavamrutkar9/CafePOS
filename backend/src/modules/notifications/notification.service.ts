// TODO: Implement KDS alert triggers and user notification pipeline. Service has no req/res.

export class NotificationService {
  async sendOrderAlert(orderId: string, message: string) {
    console.log(`Notification for Order ${orderId}: ${message}`);
  }
}
