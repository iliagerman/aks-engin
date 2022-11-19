"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const market_data_statics_1 = require("./market-data.statics");
const MarketDataSchema = new mongoose_1.Schema({
    current_price: Number,
    curreny: String,
    coin: String,
    lastUpdated: {
        type: Date,
        default: new Date(),
    },
});
MarketDataSchema.statics.getLatestRecords = market_data_statics_1.getLatestRecords;
exports.default = MarketDataSchema;
//# sourceMappingURL=market-data.schema.js.map