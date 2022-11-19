import * as Mongoose from "mongoose";
export class Database {
  MONGO_DB_USERNMAE = process.env.MONGO_DB_USERNMAE ? process.env.MONGO_DB_USERNMAE : "root";
  MONGO_DB_PASSWORD = process.env.MONGO_DB_PASSWORD ? process.env.MONGO_DB_PASSWORD : "Cowabunga";
  MONGO_DB_URL = process.env.MONGO_DB_URL ? process.env.MONGO_DB_URL : "127.0.0.1";
  DB_NAME = process.env.DB_NAME ? process.env.DB_NAME : "";
  connectionString = `mongodb://${this.MONGO_DB_USERNMAE}:${this.MONGO_DB_PASSWORD}@${this.MONGO_DB_URL}${this.DB_NAME}`;
  client: any;
  async connect() {
    // add async
    try {
        if (!this.client) {
        console.log("connecting to mongo");
        console.log("setting client");
        this.client = await Mongoose.connect(this.connectionString, { autoIndex: true });
        console.log(this.client);
      }
    } catch (error) {
      console.log("error during connecting to mongo: ");
      console.error(error);
    }
  }
  async disconnect() {
    if (!this.client) {
      return;
    }
    await Mongoose.disconnect();
  }
}
