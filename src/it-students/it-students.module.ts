import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ItStudent, ItStudentSchema } from './it-student.schema';
import { ItStudentsService } from './it-students.service';
import { ItStudentsController } from './it-students.controller';
import { SequenceModule } from '../sequence/sequence.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: ItStudent.name, schema: ItStudentSchema }]), SequenceModule],
  controllers: [ItStudentsController],
  providers: [ItStudentsService],
})
export class ItStudentsModule {}
