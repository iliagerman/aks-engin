import { Document, Model } from "mongoose";
export interface IMarketData {
  current_price: number;
  curreny: string;
  coin: string;
  lastUpdated?: Date;
}
export interface IMarketDataDocument extends IMarketData, Document {}
export interface IMarketDataModel extends Model<IMarketDataDocument> {
  getLatestRecords: ({
    current_price,
    curreny,
    coin,
    lastUpdated,
  }: {
    current_price: number;
    curreny: string;
    coin: string;
    lastUpdated: number;
  }) => Promise<IMarketData>;
}
