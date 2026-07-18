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
import { SequenceModule } from './sequence/sequence.module';
import { DropUniqueSnIndexesMigration } from './migrations/drop-unique-sn-indexes';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_URI ?? 'mongodb://localhost:27017/bigstack_management', {
      // Fail fast (default 10s) instead of hanging for 30s on every cold start.
      // This is critical on Vercel where Lambda timeouts are tight.
      serverSelectionTimeoutMS: 10_000,
      connectionFactory: (connection) => {
        // Diagnostic: log the URI host (no credentials) and the initial state.
        const uri = process.env.MONGO_URI ?? 'mongodb://localhost:27017/bigstack_management';
        // eslint-disable-next-line no-console
        console.log(
          `[MongoDB] initialising — host: ${uri.replace(/\/\/[^@]*@/, '//***@')}, readyState: ${connection.readyState}`,
        );
        connection.on('connected', () => {
          // eslint-disable-next-line no-console
          console.log(`[MongoDB] connected — readyState: ${connection.readyState}`);
        });
        connection.on('error', (err) => {
          // eslint-disable-next-line no-console
          console.error(`[MongoDB] error — readyState: ${connection.readyState}`, err);
        });
        connection.on('disconnected', () => {
          // eslint-disable-next-line no-console
          console.warn(`[MongoDB] disconnected — readyState: ${connection.readyState}`);
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
  providers: [DropUniqueSnIndexesMigration],
})
export class AppModule {}
