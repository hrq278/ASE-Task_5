// models/Counter.model.js
import mongoose from 'mongoose';

const CounterSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  sequenceValue: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Static method to get next sequence
CounterSchema.statics.getNextSequence = async function(sequenceName) {
  const counter = await this.findByIdAndUpdate(
    sequenceName,
    { $inc: { sequenceValue: 1 } },
    { new: true, upsert: true }
  );
  return counter.sequenceValue;
};

const Counter = mongoose.model('Counter', CounterSchema);
export default Counter;