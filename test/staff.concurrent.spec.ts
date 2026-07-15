import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication } from '@nestjs/common';
import { StaffService } from '../src/staff/staff.service';
import mongoose from 'mongoose';

describe('Staff concurrent creation', () => {
  let app: INestApplication;
  let service: StaffService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = module.createNestApplication();
    await app.init();
    service = module.get(StaffService);
    // reset collections used by the test
    await mongoose.connection.collection('staff').deleteMany({});
    await mongoose.connection.collection('counters').deleteOne({ _id: 'staff' });
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates 20 staff concurrently without duplicate SN', async () => {
    const N = 20;
    const createDto = () => ({
      firstName: 'Test',
      lastName: 'User',
      role: 'Teacher',
      date: new Date().toISOString().slice(0, 10),
    });

    const tasks = Array.from({ length: N }).map(() => service.create(createDto()));
    const results = await Promise.all(tasks);

    const sns = results.map((r) => r.sn);
    const unique = new Set(sns);
    expect(sns.length).toBe(N);
    expect(unique.size).toBe(N);
  }, 20000);
});
