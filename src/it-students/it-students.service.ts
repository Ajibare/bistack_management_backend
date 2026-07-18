import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ItStudent, ItStudentDocument } from './it-student.schema';
import { CreateItStudentDto, UpdateItStudentDto } from './it-student.dto';
import { SequenceService } from '../sequence/sequence.service';

@Injectable()
export class ItStudentsService {
  constructor(
    @InjectModel(ItStudent.name)
    private readonly model: Model<ItStudentDocument>,
    private readonly sequenceService: SequenceService,
  ) {}

  findAll() {
    return this.model.find().sort({ createdAt: 1 }).exec();
  }

  async findOne(id: string) {
    const record = await this.model.findById(id).exec();
    if (!record) throw new NotFoundException(`IT Student #${id} not found`);
    return record;
  }

  async create(dto: CreateItStudentDto) {
    const seq = await this.sequenceService.getNextSequence('it-student');
    const sn = `BST-RG${String(seq).padStart(3, '0')}`;
    return this.model.create({ ...dto, sn });
  }

  async update(id: string, dto: UpdateItStudentDto) {
    const record = await this.model.findById(id).exec();
    if (!record) throw new NotFoundException(`IT Student #${id} not found`);
    record.set(dto);
    return record.save();
  }

  async remove(id: string) {
    const record = await this.model.findByIdAndDelete(id).exec();
    if (!record) throw new NotFoundException(`IT Student #${id} not found`);
    return record;
  }
}
