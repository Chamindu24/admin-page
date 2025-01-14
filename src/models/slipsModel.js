import mongoose, { Schema, Document } from 'mongoose';

// Define the Slips schema
const SlipsSchema = new Schema({
  imageUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Create and export the Slips model
const Slips = mongoose.models.Slips || mongoose.model('Slips', SlipsSchema);
export default Slips;
