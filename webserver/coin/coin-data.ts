import { MarketDataModel } from "../database/market-data/market-data.model";
import axios from "axios";
import moment = require("moment");
import { Database } from "../database/database";
import { exit } from "process";
export class CoinData {
  static async getMarketData(db: Database) {
    await db.connect();
    var before10Minutes = moment(new Date()).subtract(10, "m").toDate().getTime();
    const marketData = await MarketDataModel.find().sort({ lastUpdated: -1 }).where("lastupdated").gt(before10Minutes);
    if(process.env.DEBUG) {
      console.log(`before10Minutes: ${before10Minutes}`);
      console.log(`marketData: ${marketData}`);
    }
    return marketData;
  }
  static async addMarketData(db: Database): Promise<any> {
    console.log("Adding market data");
    const API_URL = process.env.API_URL ? process.env.API_URL : "https://blockchain.info/ticker";
    await db.connect();
    const { data, status } = await axios.get<any>(API_URL, {
      headers: {
        Accept: "application/json",
      },
    });
    if (status === 200) {
      const marketData = {
        lastUpdated: new Date(),
        curreny: "USD",
        current_price: data.USD.last,
        coin: "BTC",
      };
      try {
        
        await MarketDataModel.create(marketData);
        console.log(`Created market data`);
      } catch (e) {
        console.error(e);
        exit(1);
      }
    } else {
      exit(1);
    }
    return { status: 200, message: "OK" };
  }
}
