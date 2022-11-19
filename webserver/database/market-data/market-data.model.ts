import { model } from "mongoose";
import { IMarketDataDocument } from "./market-data.types";
import MarketDataSchema from "./market-data.schema";
export const MarketDataModel = model<IMarketDataDocument>("marketData", MarketDataSchema);
