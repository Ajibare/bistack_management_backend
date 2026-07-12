import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Staff, StaffDocument } from './staff.schema';
import { CreateStaffDto, UpdateStaffDto } from './staff.dto';

@Injectable()
export class StaffService {
  constructor(
    @InjectModel(Staff.name)
    private readonly model: Model<StaffDocument>,
  ) {}

  findAll() {
    return this.model.find().sort({ createdAt: 1 }).exec();
  }

  async findOne(id: string) {
    const record = await this.model.findById(id).exec();
    if (!record) throw new NotFoundException(`Staff #${id} not found`);
    return record;
  }

  async create(dto: CreateStaffDto) {
    const count = await this.model.countDocuments();
    const sn = `BST-SF${String(count + 1).padStart(3, '0')}`;
    return this.model.create({ ...dto, sn });
  }

  async update(id: string, dto: UpdateStaffDto) {
    const record = await this.model
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!record) throw new NotFoundException(`Staff #${id} not found`);
    return record;
  }

  async remove(id: string) {
    const record = await this.model.findByIdAndDelete(id).exec();
    if (!record) throw new NotFoundException(`Staff #${id} not found`);
    return record;
  }
}
