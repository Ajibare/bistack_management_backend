import * as mongoose from 'mongoose';

/**
 * Returns the next integer for a named counter and atomically increments it.
 *
 * The `counters` collection uses string `_id`s (e.g. "student", "staff", "kcp")
 * rather than ObjectIds. The mongodb driver's strict `Filter<{ _id: ObjectId }>` typing
 * does not allow this, so we cast the collection to `any` for the queries.
 *
 * IMPORTANT: On Vercel/serverless, the global `mongoose.connection` can be
 * `undefined` if the first request arrives before MongooseModule's
 * onModuleInit has fully wired up the connection. To be robust, this function:
 *   1. Returns the existing `mongoose.connection` if it's already connected.
 *   2. Awaits its `asPromise()` if the connection is in flight.
 *   3. As a last resort, performs a direct `mongoose.connect()` with the
 *      configured MONGO_URI so the call still works on cold starts.
 */
export async function getNextSequence(name: string): Promise<number> {
  const uri =
    process.env.MONGO_URI ?? 'mongodb://localhost:27017/bigstack_management';

  // Step 1+2: if a connection already exists (even if still connecting),
  // wait for it to be ready.
  let conn = mongoose.connection;
  if (conn && conn.readyState === 1) {
    // Already connected — proceed.
  } else {
    if (conn) {
      // Connection exists but isn't ready — wait for it.
      try {
        await conn.asPromise();
      } catch {
        // Fall through to direct connect below.
      }
    }

    // Step 3: if we still don't have a ready connection, do a direct connect.
    conn = mongoose.connection;
    if (!conn || conn.readyState !== 1) {
      // eslint-disable-next-line no-console
      console.warn(
        `[sequence] No ready Mongoose connection (state=${conn?.readyState}). ` +
          `Performing direct connect for counter "${name}".`,
      );
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 10_000 });
      conn = mongoose.connection;
    }
  }

  // The mongodb driver types `_id` as ObjectId, but the `counters` collection
  // uses friendly string IDs (e.g. "student", "staff"). Cast to `any` to bypass.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const coll = conn!.collection('counters') as any;

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
