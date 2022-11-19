"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = void 0;
const Mongoose = require("mongoose");
class Database {
    constructor() {
        this.MONGO_DB_USERNMAE = process.env.MONGO_DB_USERNMAE ? process.env.MONGO_DB_USERNMAE : "root";
        this.MONGO_DB_PASSWORD = process.env.MONGO_DB_PASSWORD ? process.env.MONGO_DB_PASSWORD : "Cowabunga";
        this.MONGO_DB_URL = process.env.MONGO_DB_URL ? process.env.MONGO_DB_URL : "127.0.0.1";
        this.connectionString = `mongodb://${this.MONGO_DB_USERNMAE}:${this.MONGO_DB_PASSWORD}@${this.MONGO_DB_URL}`;
    }
    async connect() {
        // add async
        try {
            if (!this.client) {
                console.log("connecting to mongo");
                console.log("setting client");
                this.client = await Mongoose.connect(this.connectionString, { autoIndex: true });
                this.client.getCollectionNames();
                console.log(this.client);
            }
        }
        catch (error) {
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
exports.Database = Database;
//# sourceMappingURL=database.js.map