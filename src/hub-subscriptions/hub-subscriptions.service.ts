import { Injectable, NotFoundException, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HubSubscription, HubSubscriptionDocument } from './hub-subscription.schema';
import { CreateHubSubscriptionDto, UpdateHubSubscriptionDto } from './hub-subscription.dto';
import nodemailer from 'nodemailer';
import { InvoiceService } from '../finance/invoice.service';
import { SequenceService } from '../sequence/sequence.service';

@Injectable()
export class HubSubscriptionsService {
  private readonly logger = new Logger(HubSubscriptionsService.name);
  private readonly transporter = process.env.SMTP_HOST ? nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER ? {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    } : undefined,
  }) : null;

  constructor(
    @InjectModel(HubSubscription.name)
    private readonly model: Model<HubSubscriptionDocument>,
    private readonly invoiceService: InvoiceService,
    private readonly sequenceService: SequenceService,
  ) {
    const interval = Number(process.env.REMINDER_CHECK_INTERVAL_MS ?? 86400000);
    setInterval(() => void this.runExpiryReminders(), interval);
  }

  findAll() {
    return this.model.find().sort({ createdAt: 1 }).exec();
  }

  async findOne(id: string) {
    const record = await this.model.findById(id).exec();
    if (!record) throw new NotFoundException(`Subscription #${id} not found`);
    return record;
  }

  private computeExpiryDate(startDate: string, months: number) {
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + months);
    return date.toISOString().slice(0, 10);
  }

  private async sendEmail(to: string, subject: string, html: string) {
    if (!this.transporter) {
      this.logger.error(`SMTP is not configured; cannot send email to ${to}`);
      throw new Error('SMTP_NOT_CONFIGURED');
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM ?? 'no-reply@bigstack.com',
      to,
      subject,
      html,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent to ${to} with subject '${subject}'`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${error}`);
      throw error;
    }
  }

  async create(dto: CreateHubSubscriptionDto) {
    const seq = await this.sequenceService.getNextSequence('hub-subscription');
    const sn = `BST-HB${String(seq).padStart(3, '0')}`;
    const expiresAt = dto.isMonthly && dto.months
      ? this.computeExpiryDate(dto.date, dto.months)
      : dto.expiresAt;

    return this.model.create({ ...dto, sn, expiresAt });
  }

  async update(id: string, dto: UpdateHubSubscriptionDto) {
    const record = await this.model.findById(id).exec();
    if (!record) throw new NotFoundException(`Subscription #${id} not found`);

    if (dto.isMonthly && dto.months) {
      dto.expiresAt = this.computeExpiryDate(dto.date ?? record.date, dto.months);
    }

    Object.assign(record, dto);
    await record.save();
    return record;
  }

  async sendInvoice(id: string) {
    try {
      return await this.invoiceService.sendInvoiceFor('hub', id);
    } catch (err) {
      if ((err as any).response?.status === 400 || (err as Error).message === 'SMTP_NOT_CONFIGURED') {
        throw new BadRequestException('SMTP is not configured on the server. Configure SMTP to send receipts.');
      }
      this.logger.error(`Error sending receipt for ${id}: ${err}`);
      throw new InternalServerErrorException('Failed to send receipt email');
    }
  }

  private async runExpiryReminders() {
    const now = new Date();
    const reminderDate = new Date(now);
    reminderDate.setDate(now.getDate() + 5);
    const targetDate = reminderDate.toISOString().slice(0, 10);

    const subscriptions = await this.model.find({
      expiresAt: targetDate,
      $or: [{ lastReminderSentAt: { $exists: false } }, { lastReminderSentAt: null }],
    }).exec();

    if (!subscriptions.length) {
      this.logger.log(`No expiry reminders to send for ${targetDate}.`);
      return;
    }

    for (const subscription of subscriptions) {
      const html = `
        <h1>Your subscription expires in 5 days</h1>
        <p>Hi ${subscription.name},</p>
        <p>Your subscription with ID ${subscription.sn} will expire on ${subscription.expiresAt}.</p>
        <p>If you would like to continue, please renew or contact support.</p>
      `;
      await this.sendEmail(subscription.email, 'Subscription expiry reminder', html);
      subscription.lastReminderSentAt = new Date().toISOString();
      await subscription.save();
    }
  }

  async remove(id: string) {
    const record = await this.model.findByIdAndDelete(id).exec();
    if (!record) throw new NotFoundException(`Subscription #${id} not found`);
    return record;
  }
}
