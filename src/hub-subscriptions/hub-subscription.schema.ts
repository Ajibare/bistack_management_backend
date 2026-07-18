import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type HubSubscriptionDocument = HydratedDocument<HubSubscription>;

@Schema({ timestamps: true, collection: 'hub_subscriptions' })
export class HubSubscription {
  @Prop({ required: true })
  sn: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ default: 0 })
  amountPaid: number;

  @Prop()
  duration?: string;

  @Prop({ default: false })
  isMonthly: boolean;

  @Prop({ default: 1 })
  months: number;

  @Prop({ required: true })
  expiresAt: string;

  @Prop({ required: true })
  date: string;

  @Prop()
  invoiceSentAt?: string;

  @Prop()
  lastReminderSentAt?: string;
}

export const HubSubscriptionSchema = SchemaFactory.createForClass(HubSubscription);
