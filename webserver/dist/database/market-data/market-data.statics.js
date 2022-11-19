"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLatestRecords = void 0;
async function getLatestRecords(records) {
    const record = await this.find().sort({ lastUpdated: -1 }).limit(records);
    if (!record) {
        ///TODO: fetch values from API
    }
    return record;
}
exports.getLatestRecords = getLatestRecords;
//# sourceMappingURL=market-data.statics.js.map