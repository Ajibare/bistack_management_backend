import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

/**
 * Auto-incrementing sequence service backed by a `counters` collection.
 *
 * Each named counter uses a string `_id` (e.g. "student", "staff", "kcp")
 * and stores an integer `seq` field. We use `@InjectConnection()` so that
 * Nest properly injects the SAME Mongoose Connection that `MongooseModule.forRoot()`
 * created, instead of relying on the global `mongoose.connection` singleton
 * (which is unreliable in serverless environments like Vercel).
 */
@Injectable()
export class SequenceService {
  private readonly logger = new Logger(SequenceService.name);

  constructor(@InjectConnection() private readonly connection: Connection) {}

  /**
   * Atomically increment the counter named `name` and return the new value.
   * If the counter does not exist yet it is created with value 1.
   */
  async getNextSequence(name: string): Promise<number> {
    // The mongodb driver types `_id` as ObjectId in its Filter generic, but
    // this collection intentionally uses friendly string IDs. Cast to `any`
    // so the call type-checks while keeping the runtime behaviour we want.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const coll = this.connection.collection('counters') as any;

    const res = await coll.findOneAndUpdate(
      { _id: name },
      { $inc: { seq: 1 } },
      { upsert: true, returnDocument: 'after' },
    );

    const doc =
      (res?.value as { _id: string; seq: number } | null) ||
      (await coll.findOne({ _id: name }));

    if (doc?.seq == null) {
      throw new Error(
        `SequenceService.getNextSequence("${name}"): counter was upserted but seq is missing.`,
      );
    }
    return doc.seq;
  }
}
