import { Injectable, Logger, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import PDFDocument from 'pdfkit';
import getStream from 'get-stream';
import nodemailer from 'nodemailer';
import { Student, StudentDocument } from '../students/student.schema';
import { Kcp, KcpDocument } from '../kcp/kcp.schema';
import { ItStudent, ItStudentDocument } from '../it-students/it-student.schema';
import { HubSubscription, HubSubscriptionDocument } from '../hub-subscriptions/hub-subscription.schema';
import fs from 'fs';
import https from 'https';

type EntityType = 'hub' | 'student' | 'kcp' | 'it';

@Injectable()
export class InvoiceService {
  private readonly logger = new Logger(InvoiceService.name);
  private readonly COMPANY_NAME = process.env.COMPANY_NAME ?? 'BIGSTACK TECHNOLOGIES';
  private readonly COMPANY_ADDRESS = process.env.COMPANY_ADDRESS ?? '167 Old Odukpani Road, Ikot Ishie, Calabar';
  private readonly COMPANY_PHONE = process.env.COMPANY_PHONE ?? '+234 811 001 1847, +234 816 906 6559';
  private readonly COMPANY_EMAIL = process.env.COMPANY_EMAIL ?? 'info@bigstacktech.com';
  private readonly transporter = process.env.SMTP_HOST ? nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  }) : null;

  constructor(
    @InjectModel(Student.name) private readonly studentModel: Model<StudentDocument>,
    @InjectModel(Kcp.name) private readonly kcpModel: Model<KcpDocument>,
    @InjectModel(ItStudent.name) private readonly itStudentModel: Model<ItStudentDocument>,
    @InjectModel(HubSubscription.name) private readonly hubModel: Model<HubSubscriptionDocument>,
  ) {}

  private async fetchImageBuffer(url: string): Promise<Buffer | null> {
    return new Promise((resolve, reject) => {
      try {
        const req = https.get(url, (res) => {
          const data: Buffer[] = [];
          res.on('data', (chunk) => data.push(Buffer.from(chunk)));
          res.on('end', () => resolve(Buffer.concat(data)));
          res.on('error', (err) => reject(err));
        });
        req.on('error', (err) => reject(err));
      } catch (err) {
        reject(err);
      }
    });
  }

  private async generatePdfBuffer(title: string, bodyLines: string[], amount: number, sn: string) {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    const logoPath = process.env.INVOICE_LOGO_PATH;
    const logoUrl = process.env.INVOICE_LOGO_URL;

    // If a remote logo URL is provided, fetch it and embed
    if (logoUrl) {
      try {
        const buffer = await this.fetchImageBuffer(logoUrl);
        if (buffer && buffer.length) {
          doc.image(buffer, 50, 45, { width: 120 });
        }
      } catch (e) {
        this.logger.warn(`Failed to fetch/embed logo from URL ${logoUrl}: ${e}`);
      }
    } else if (logoPath && fs.existsSync(logoPath)) {
      try {
        doc.image(logoPath, 50, 45, { width: 120 });
      } catch (e) {
        this.logger.warn(`Failed to embed logo from ${logoPath}: ${e}`);
      }
    }

    // Company block
    doc.fontSize(12).text(this.COMPANY_NAME, 50, 170);
    doc.fontSize(9).text(this.COMPANY_ADDRESS, 50, 185);
    doc.fontSize(9).text(`Phone: ${this.COMPANY_PHONE}`, 50, 200);
    doc.fontSize(9).text(`Email: ${this.COMPANY_EMAIL}`, 50, 215);

    doc.fontSize(20).text('INVOICE', 400, 50, { align: 'right' });
    doc.moveDown();
    doc.fontSize(10).text(`Invoice #: ${sn}`);
    doc.text(`Date: ${new Date().toISOString().slice(0,10)}`);
    doc.moveDown();
    bodyLines.forEach((l) => { doc.text(l); });
    doc.moveDown();
    doc.fontSize(12).text(`Amount Due: ₦${amount.toLocaleString()}`, { align: 'right' });
    doc.moveDown(2);
    doc.fontSize(9).text('Thank you for your business.', { align: 'center' });
    doc.end();
    await new Promise((res) => doc.on('end', res));
    return Buffer.concat(chunks);
  }

  private async sendMailWithAttachment(to: string, subject: string, html: string, pdfBuffer: Buffer, filename = 'invoice.pdf') {
    if (!this.transporter) {
      this.logger.error('SMTP is not configured; cannot send email');
      throw new BadRequestException('SMTP is not configured on the server. Configure SMTP to send invoices.');
    }
    const mailOptions = {
      from: process.env.EMAIL_FROM ?? 'no-reply@bigstack.com',
      to,
      subject,
      html,
      attachments: [
        {
          filename,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Invoice email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send invoice email to ${to}: ${error}`);
      throw new InternalServerErrorException('Failed to send invoice email');
    }
  }

  async sendInvoiceFor(type: EntityType, id: string) {
    let rec: any = null;
    if (type === 'hub') rec = await this.hubModel.findById(id).exec();
    if (type === 'student') rec = await this.studentModel.findById(id).exec();
    if (type === 'kcp') rec = await this.kcpModel.findById(id).exec();
    if (type === 'it') rec = await this.itStudentModel.findById(id).exec();

    if (!rec) throw new NotFoundException(`${type} record #${id} not found`);

    const name = rec.name ?? 'Customer';
    const email = rec.email;
    if (!email) {
      this.logger.error(`No email address available for ${type} ${id}`);
      throw new BadRequestException('No email address on record to send invoice');
    }
    // Build invoice body lines depending on type
    const lines: string[] = [];
    let amount = 0;
    if (type === 'hub') {
      lines.push(`Subscription ID: ${rec.sn}`);
      lines.push(`Start date: ${rec.date}`);
      lines.push(`Expiry date: ${rec.expiresAt}`);
      lines.push(`Duration: ${rec.duration ?? (rec.months ? `${rec.months} month(s)` : 'N/A')}`);
      amount = rec.amountPaid ?? 0;
    } else if (type === 'student' || type === 'kcp' || type === 'it') {
      lines.push(`ID: ${rec.sn}`);
      lines.push(`Course/Department: ${rec.course ?? rec.department ?? ''}`);
      lines.push(`Start date: ${rec.date}`);
      lines.push(`Duration: ${rec.duration ?? ''}`);
      lines.push(`Amount Paid: ₦${(rec.amountPaid ?? 0).toLocaleString()}`);
      lines.push(`Balance: ₦${(rec.balance ?? 0).toLocaleString()}`);
      amount = rec.feeToPay ?? rec.balance ?? (rec.amountPaid ?? 0);
    }

    const sn = rec.sn ?? id;
    const pdf = await this.generatePdfBuffer(`Invoice for ${name}`, lines, amount, sn);

    const html = `
      <div style="font-family: sans-serif; font-size: 14px;">
        <p>Hi ${name},</p>
        <p>Please find attached your invoice (<strong>${sn}</strong>).</p>
        <p>Amount due: <strong>₦${amount.toLocaleString()}</strong></p>
        <hr />
        <h4>Contact With Us</h4>
        <p><strong>Phone:</strong> ${this.COMPANY_PHONE}</p>
        <p><strong>Address:</strong> ${this.COMPANY_ADDRESS}</p>
        <p><strong>Email:</strong> ${this.COMPANY_EMAIL}</p>
        <p>If you have any questions, reply to this email or contact support.</p>
      </div>
    `;

    await this.sendMailWithAttachment(email, `Your Invoice - ${sn}`, html, pdf, `invoice-${sn}.pdf`);

    // update record where applicable
    if (type === 'hub') {
      rec.invoiceSentAt = new Date().toISOString();
      await rec.save();
    }

    return { message: 'Invoice sent', sn };
  }
}
