import "dotenv/config";
import mongoose from "mongoose";
import Message from "../models/Message.js";
import { connectDB } from "../lib/db.js";
import { getConversationId } from "../lib/utils.js";

const BATCH_SIZE = 500;

const run = async () => {
    await connectDB();

    let processed = 0;
    let updated = 0;

    const cursor = Message.find({ conversationId: { $exists: false } })
        .select("_id senderId receiverId")
        .lean()
        .cursor();

    let ops = [];

    for await (const doc of cursor) {
        processed += 1;
        const conversationId = getConversationId(doc.senderId, doc.receiverId);

        ops.push({
            updateOne: {
                filter: { _id: doc._id },
                update: { $set: { conversationId } },
            },
        });

        if (ops.length >= BATCH_SIZE) {
            const res = await Message.bulkWrite(ops, { ordered: false });
            updated += res.modifiedCount || 0;
            ops = [];
            console.log(`Processed ${processed}, updated ${updated}`);
        }
    }

    if (ops.length) {
        const res = await Message.bulkWrite(ops, { ordered: false });
        updated += res.modifiedCount || 0;
    }

    console.log(`Done. Processed ${processed}, updated ${updated}`);
    await mongoose.connection.close();
};

run().catch(async (err) => {
    console.error(err);
    try {
        await mongoose.connection.close();
    } catch {
        // ignore
    }
    process.exitCode = 1;
});
