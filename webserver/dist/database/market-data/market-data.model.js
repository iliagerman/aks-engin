"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketDataModel = void 0;
const mongoose_1 = require("mongoose");
const market_data_schema_1 = require("./market-data.schema");
exports.MarketDataModel = (0, mongoose_1.model)("marketData", market_data_schema_1.default);
//# sourceMappingURL=market-data.model.js.map