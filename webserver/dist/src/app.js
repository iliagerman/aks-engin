"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const coin_data_1 = require("../coin/coin-data");
const database_1 = require("../database/database");
const app = express();
const port = 3000;
let db = new database_1.Database();
app.get("/", async (req, res) => {
    try {
        const marketData = await coin_data_1.CoinData.getMarketData(db);
        if (process.env.DEBUG) {
            console.log(`marketData: ${marketData}`);
        }
        const avg = marketData.reduce((a, b) => a + b.current_price, 0) / marketData.length;
        if (process.env.DEBUG) {
            console.log(`avg: ${avg}`);
        }
        return res
            .status(200)
            .send(`<html> <head>Bitcoin Values</head><body><p>avarage (last 10 minutes): ${avg}</p><p>last: ${marketData[0].current_price}</p></body></html>`);
    }
    catch (err) {
        return res.status(500).send(err);
    }
});
app.post("/", async (req, res) => {
    const restult = await coin_data_1.CoinData.addMarketData(db);
    return res.status(restult.status).send(restult.message);
});
app.get("/health", (req, res) => {
    return res.status(200).send("OK");
});
app.listen(port, () => {
    console.log(`Server listening at port: ${port}`);
});
//# sourceMappingURL=app.js.map