"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoinData = void 0;
const market_data_model_1 = require("../database/market-data/market-data.model");
const axios_1 = require("axios");
const moment = require("moment");
const process_1 = require("process");
class CoinData {
    static async getMarketData(db) {
        await db.connect();
        var before10Minutes = moment(new Date()).subtract(10, "m").toDate().getTime();
        const marketData = await market_data_model_1.MarketDataModel.find().sort({ lastUpdated: -1 }).where("lastupdated").gt(before10Minutes);
        if (process.env.DEBUG) {
            console.log(`before10Minutes: ${before10Minutes}`);
            console.log(`marketData: ${marketData}`);
        }
        return marketData;
    }
    static async addMarketData(db) {
        console.log("Adding market data");
        const API_URL = process.env.API_URL ? process.env.API_URL : "https://blockchain.info/ticker";
        await db.connect();
        const { data, status } = await axios_1.default.get(API_URL, {
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
                await market_data_model_1.MarketDataModel.create(marketData);
                console.log(`Created market data`);
                await market_data_model_1.MarketDataModel.deleteMany({ orderExpDate: { "$lt": new Date(Date.now() - 11 * 60 * 1000) } });
                console.log(`Deleted old market data`);
            }
            catch (e) {
                console.error(e);
                (0, process_1.exit)(1);
            }
        }
        else {
            (0, process_1.exit)(1);
        }
        return { status: 200, message: "OK" };
    }
}
exports.CoinData = CoinData;
//# sourceMappingURL=coin-data.js.map