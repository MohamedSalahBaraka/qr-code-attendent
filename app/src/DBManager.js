const Database = require("better-sqlite3");
const path = require("path");

const dbPath = process.env.NODE_ENV === "development" ? path.join(__dirname, "../../database.db") : path.join(process.resourcesPath, "./database.db");
console.log("process.env.NODE_ENV: ", process.env.NODE_ENV);

const db = new Database(path.join(process.resourcesPath, "./database.db"));
db.pragma("journal_mode = WAL");

exports.db = db;
