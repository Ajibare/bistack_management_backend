import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HubSubscription, HubSubscriptionSchema } from './hub-subscription.schema';
import { HubSubscriptionsService } from './hub-subscriptions.service';
import { HubSubscriptionsController } from './hub-subscriptions.controller';
import { FinanceModule } from '../finance/finance.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: HubSubscription.name, schema: HubSubscriptionSchema }]), FinanceModule],
  controllers: [HubSubscriptionsController],
  providers: [HubSubscriptionsService],
})
export class HubSubscriptionsModule {}
