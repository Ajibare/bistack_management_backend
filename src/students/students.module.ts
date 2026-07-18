import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Student, StudentSchema } from './student.schema';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { SequenceModule } from '../sequence/sequence.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: Student.name, schema: StudentSchema }]), SequenceModule],
  controllers: [StudentsController],
  providers: [StudentsService],
})
export class StudentsModule {}
