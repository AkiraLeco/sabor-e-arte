import mongoose from 'mongoose';

const Counter = mongoose.model(
  'Counter',
  new mongoose.Schema({ _id: String, seq: { type: Number, default: 0 } })
);

export async function nextSequence(name) {
  const c = await Counter.findByIdAndUpdate(name, { $inc: { seq: 1 } }, { new: true, upsert: true });
  return c.seq;
}

export default Counter;
