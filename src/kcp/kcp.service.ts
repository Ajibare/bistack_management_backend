import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Kcp, KcpDocument } from './kcp.schema';
import { CreateKcpDto, UpdateKcpDto } from './kcp.dto';
import { getNextSequence } from '../lib/sequence';

@Injectable()
export class KcpService {
  constructor(
    @InjectModel(Kcp.name)
    private readonly model: Model<KcpDocument>,
  ) {}

  findAll() {
    return this.model.find().sort({ createdAt: 1 }).exec();
  }

  async findOne(id: string) {
    const record = await this.model.findById(id).exec();
    if (!record) throw new NotFoundException(`KCP record #${id} not found`);
    return record;
  }

  async create(dto: CreateKcpDto) {
    const seq = await getNextSequence('kcp');
    const sn = `BST-KC${String(seq).padStart(3, '0')}`;
    return this.model.create({ ...dto, sn });
  }

  async update(id: string, dto: UpdateKcpDto) {
    const record = await this.model.findById(id).exec();
    if (!record) throw new NotFoundException(`KCP record #${id} not found`);
    record.set(dto);
    return record.save();
  }

  async remove(id: string) {
    const record = await this.model.findByIdAndDelete(id).exec();
    if (!record) throw new NotFoundException(`KCP record #${id} not found`);
    return record;
  }
}
