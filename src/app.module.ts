import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { StudentsModule } from './students/students.module';
import { ItStudentsModule } from './it-students/it-students.module';
import { HubSubscriptionsModule } from './hub-subscriptions/hub-subscriptions.module';
import { FinanceModule } from './finance/finance.module';
import { CoursesModule } from './courses/courses.module';
import { KcpModule } from './kcp/kcp.module';
import { StaffModule } from './staff/staff.module';
import { RolesModule } from './roles/roles.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_URI ?? 'mongodb://localhost:27017/bigstack_management', {
      connectionFactory: (connection) => {
        connection.on('connected', () => {
          console.log('✅ Database connected successfully');
        });
        connection.on('error', (err) => {
          console.error('❌ Database connection error:', err);
        });
        return connection;
      },
    }),
    StudentsModule,
    ItStudentsModule,
    HubSubscriptionsModule,
    FinanceModule,
    CoursesModule,
    KcpModule,
    StaffModule,
    RolesModule,
  ],
})
export class AppModule {}
