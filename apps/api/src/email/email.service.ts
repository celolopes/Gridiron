import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend | null = null;

  constructor() {
    if (process.env.RESEND_API_KEY) {
      this.resend = new Resend(process.env.RESEND_API_KEY);
      this.logger.log('Resend initialized with API key.');
    } else {
      this.logger.warn('RESEND_API_KEY not found. Emails will be mocked.');
    }
  }

  async sendEmail(to: string, subject: string, body: string) {
    if (this.resend) {
      try {
        await this.resend.emails.send({
          from: 'Acme <onboarding@resend.dev>', // Should use a verified domain in prob
          to: [to],
          subject: subject,
          html: body,
        });
        this.logger.log(`Email sent via Resend to ${to}`);
        return true;
      } catch (e) {
        this.logger.error(`Error sending email to ${to}: ${e.message}`);
        return false;
      }
    } else {
      this.logger.log(`[MOCK EMAIL] To: ${to} | Subject: ${subject}`);
      this.logger.debug(body);
      return true;
    }
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
