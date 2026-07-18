import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Kcp, KcpSchema } from './kcp.schema';
import { KcpService } from './kcp.service';
import { KcpController } from './kcp.controller';
import { SequenceModule } from '../sequence/sequence.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: Kcp.name, schema: KcpSchema }]), SequenceModule],
  controllers: [KcpController],
  providers: [KcpService],
})
export class KcpModule {}
