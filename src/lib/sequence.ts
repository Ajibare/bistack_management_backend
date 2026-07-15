import * as mongoose from 'mongoose';

/**
 * Returns the next integer for a named counter and atomically increments it.
 *
 * The `counters` collection uses string `_id`s (e.g. "student", "staff", "kcp")
 * rather than ObjectIds. The mongodb driver's strict `Filter<{ _id: ObjectId }>` typing
 * does not allow this, so we cast the collection to `any` for the queries.
 *
 * On Vercel/serverless the Mongoose connection can drop between invocations.
 * This function transparently re-establishes a disconnected connection before
 * touching the collection, so cold/warm invocations both work.
 */
export async function getNextSequence(name: string): Promise<number> {
  const conn = mongoose.connection;
  if (!conn) {
    throw new Error(
      `getNextSequence("${name}"): mongoose.connection is undefined. ` +
        `MongooseModule.forRoot() was never invoked or the module failed to load.`,
    );
  }

  // readyState: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
  // On Vercel, after a Lambda is idle, the connection drops. Wait for reconnect
  // instead of letting the call fail with a confusing driver error.
  if (conn.readyState !== 1) {
    // eslint-disable-next-line no-console
    console.warn(
      `[sequence] Mongoose not connected (readyState=${conn.readyState}). ` +
        `Waiting for reconnect before incrementing counter "${name}".`,
    );
    await conn.asPromise();
  }

  // The mongodb driver types `_id` as ObjectId, but the `counters` collection
  // uses friendly string IDs (e.g. "student", "staff"). Cast to `any` to bypass.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const coll = conn.collection('counters') as any;

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
