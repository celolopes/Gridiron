import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  async sendEmail(to: string, subject: string, body: string) {
    // Phase 1 Mockup for Email Sending
    // Replace with Resend or SMTP integration later
    this.logger.log(`[MOCK EMAIL] To: ${to} | Subject: ${subject}`);
    this.logger.debug(body);
    return true;
  }

  async sendOrderRequestedPayment(userEmail: string, orderId: string) {
    await this.sendEmail(
      userEmail,
      'Pedido recebido - Pagamento Pendente',
      `Recebemos seu pedido #${orderId}. Em instantes enviaremos seu link de pagamento Pix.`,
    );
  }

  async sendOrderPaymentLink(
    userEmail: string,
    orderId: string,
    paymentLink: string,
  ) {
    await this.sendEmail(
      userEmail,
      'Seu Link de Pagamento - Gridiron',
      `O link para pagamento do pedido #${orderId} está disponível: ${paymentLink}`,
    );
  }

  async sendOrderPaid(userEmail: string, orderId: string) {
    await this.sendEmail(
      userEmail,
      'Pagamento Confirmado',
      `Seu pagamento do pedido #${orderId} foi confirmado. Vamos processar seu pedido.`,
    );
  }
}
