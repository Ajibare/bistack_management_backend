import * as mongoose from 'mongoose';

/**
 * Returns the next integer for a named counter and atomically increments it.
 *
 * The `counters` collection uses string `_id`s (e.g. "student", "staff", "itStudent")
 * rather than ObjectIds. The mongodb driver's strict `Filter<{ _id: ObjectId }>` typing
 * does not allow this, so we cast the collection to `any` for the queries.
 */
export async function getNextSequence(name: string): Promise<number> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const coll = mongoose.connection.collection('counters') as any;

  const res = await coll.findOneAndUpdate(
    { _id: name },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: 'after' },
  );

  const doc =
    (res?.value as { _id: string; seq: number } | null) ||
    (await coll.findOne({ _id: name }));

  return doc?.seq ?? 1;
}
