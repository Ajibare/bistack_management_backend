import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Staff, StaffSchema } from './staff.schema';
import { StaffService } from './staff.service';
import { StaffController } from './staff.controller';
import { SequenceModule } from '../sequence/sequence.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: Staff.name, schema: StaffSchema }]), SequenceModule],
  controllers: [StaffController],
  providers: [StaffService],
})
export class StaffModule {}
