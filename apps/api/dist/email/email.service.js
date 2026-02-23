"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
let EmailService = EmailService_1 = class EmailService {
    logger = new common_1.Logger(EmailService_1.name);
    async sendEmail(to, subject, body) {
        this.logger.log(`[MOCK EMAIL] To: ${to} | Subject: ${subject}`);
        this.logger.debug(body);
        return true;
    }
    async sendOrderRequestedPayment(userEmail, orderId) {
        await this.sendEmail(userEmail, 'Pedido recebido - Pagamento Pendente', `Recebemos seu pedido #${orderId}. Em instantes enviaremos seu link de pagamento Pix.`);
    }
    async sendOrderPaymentLink(userEmail, orderId, paymentLink) {
        await this.sendEmail(userEmail, 'Seu Link de Pagamento - Gridiron', `O link para pagamento do pedido #${orderId} está disponível: ${paymentLink}`);
    }
    async sendOrderPaid(userEmail, orderId) {
        await this.sendEmail(userEmail, 'Pagamento Confirmado', `Seu pagamento do pedido #${orderId} foi confirmado. Vamos processar seu pedido.`);
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)()
], EmailService);
//# sourceMappingURL=email.service.js.map