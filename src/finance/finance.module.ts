import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FinanceEntry, FinanceEntrySchema } from './finance.schema';
import { FinanceService } from './finance.service';
import { FinanceController } from './finance.controller';
import { InvoiceService } from './invoice.service';
import { Student, StudentSchema } from '../students/student.schema';
import { Kcp, KcpSchema } from '../kcp/kcp.schema';
import { ItStudent, ItStudentSchema } from '../it-students/it-student.schema';
import { HubSubscription, HubSubscriptionSchema } from '../hub-subscriptions/hub-subscription.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: FinanceEntry.name, schema: FinanceEntrySchema }]),
    MongooseModule.forFeature([{ name: Student.name, schema: StudentSchema }]),
    MongooseModule.forFeature([{ name: Kcp.name, schema: KcpSchema }]),
    MongooseModule.forFeature([{ name: ItStudent.name, schema: ItStudentSchema }]),
    MongooseModule.forFeature([{ name: HubSubscription.name, schema: HubSubscriptionSchema }]),
  ],
  controllers: [FinanceController],
  providers: [FinanceService, InvoiceService],
  exports: [InvoiceService],
})
export class FinanceModule {}
