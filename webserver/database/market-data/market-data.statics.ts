import { IMarketDataDocument } from "./market-data.types";
export async function getLatestRecords(this: any, records:number): Promise<IMarketDataDocument> {
  const record = await this.find().sort({ lastUpdated: -1 }).limit(records);
  if (!record) {
    ///TODO: fetch values from API
  }
  return record;
}
