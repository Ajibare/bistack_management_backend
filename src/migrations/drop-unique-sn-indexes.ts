import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

/**
 * Migration to drop unique indexes on 'sn' fields that were previously constrained.
 * This allows duplicate serial numbers for renewals.
 */
@Injectable()
export class DropUniqueSnIndexesMigration implements OnModuleInit {
  private readonly logger = new Logger(DropUniqueSnIndexesMigration.name);

  constructor(@InjectConnection() private readonly connection: Connection) {}

  async onModuleInit() {
    try {
      await this.dropIndex('staff', 'sn_1');
      await this.dropIndex('students', 'sn_1');
      await this.dropIndex('it_students', 'sn_1');
      await this.dropIndex('kcp', 'sn_1');
      await this.dropIndex('hub_subscriptions', 'sn_1');
      this.logger.log('Successfully dropped unique sn indexes');
    } catch (error) {
      this.logger.error('Failed to drop unique sn indexes', error);
    }
  }

  private async dropIndex(collectionName: string, indexName: string) {
    try {
      const collection = this.connection.collection(collectionName);
      await collection.dropIndex(indexName);
      this.logger.log(`Dropped index ${indexName} from ${collectionName}`);
    } catch (error: any) {
      // Ignore error if index doesn't exist
      if (error.code !== 26 && error.message?.includes('index not found')) {
        throw error;
      }
      this.logger.warn(`Index ${indexName} not found in ${collectionName} or already dropped`);
    }
  }
}
