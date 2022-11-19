import * as express from "express";
import { Request, Response } from "express";
import { CoinData } from "../coin/coin-data";
import { Database } from "../database/database";
const app: express.Application = express();
const port: number = 3000;
let db  = new Database();
app.get("/", async (req: Request, res: Response) => {
  try {
    const marketData = await CoinData.getMarketData(db);
    if(process.env.DEBUG) {
      console.log(`marketData: ${marketData}`);
    }
    const avg = marketData.reduce((a, b) => a + b.current_price, 0) / marketData.length;
    if(process.env.DEBUG) {
      console.log(`avg: ${avg}`);
    }
    return res
      .status(200)
      .send(
        `<html> <head>Bitcoin Values</head><body><p>avarage (last 10 minutes): ${avg}</p><p>last: ${marketData[0].current_price}</p></body></html>`
      );
  } catch (err) {
    return res.status(500).send(err);
  }
});

app.post("/", async (req: Request, res: Response) => {
  const restult = await CoinData.addMarketData(db);
  return res.status(restult.status).send(restult.message);
});


app.get("/health", (req: Request, res: Response) => {
  return res.status(200).send("OK");
});

app.listen(port, () => {
  console.log(`Server listening at port: ${port}`);
});
