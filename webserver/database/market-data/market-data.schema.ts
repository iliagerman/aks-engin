import { Schema } from "mongoose";
import { getLatestRecords } from "./market-data.statics";
const MarketDataSchema = new Schema({
  current_price: Number,
  curreny: String,
  coin: String,
  lastUpdated: {
    type: Date,
    default: new Date(),
  },
  expireAt: {
    type: Date,
    default: Date.now,
    index: { expires: '10m' }
  },
});
MarketDataSchema.statics.getLatestRecords = getLatestRecords;
export default MarketDataSchema;
