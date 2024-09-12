"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
// db/database.ts
const dbmgr = require("./DBManager");
const db = dbmgr.db;
class Database {
  // Method to get a single row from the database based on a query and optional parameters
  static get(query, params = []) {
    const readQuery = db.prepare(query);
    return readQuery.get(params);
  }

  // Method to get all rows that match the query, with optional where parameters
  static getAllRow(query = "", whereParams = []) {
    const readQuery = db.prepare(query);
    return readQuery.all(whereParams);
  }

  // Method to get all rows from a specified table with customizable select fields, joins, and conditions
  static getAll(table, customSelect = "*", join = "", where = "", whereParams = []) {
    // Build the SQL query dynamically based on the provided parameters
    let query = `SELECT ${customSelect} FROM `;
    query += table; // Table name
    query += ` ${join}`; // Optional JOIN clause
    query += ` ${where}`; // Optional WHERE clause

    const readQuery = db.prepare(query);
    return readQuery.all(whereParams);
  }

  // Method to execute a query that modifies the database (INSERT, UPDATE, DELETE, etc.)
  static run(query, params = []) {
    const insertQuery = db.prepare(query);

    const transaction = db.transaction(() => {
      const info = insertQuery.run(params);
    });
    transaction();
  }

  // Method to retrieve a single row by its ID from the specified table
  static getById(id, table, customSelect = "*", join = "") {
    // Build the SQL query to select the row by ID, with optional JOINs and custom SELECT fields
    let query = `SELECT ${customSelect} FROM `;
    query += table; // Table name
    query += ` ${join} WHERE id = ?`; // WHERE clause for the ID

    // Execute the query using the `get` method and await the result
    return this.get(query, [id]);
  }

  // Method to retrieve a single row based on a specific column value from the specified table
  static getByColumn(value, column, table, customSelect = "*", join = "") {
    let query = `SELECT ${customSelect} FROM `;
    query += table; // Table name
    query += ` ${join} WHERE ${column} = ?`; // WHERE clause for the specified column

    // Execute the query using the `get` method and await the result
    return this.get(query, [value]);
  }

  // Method to delete a row from a specified table by its ID
  static deleteById(id, table) {
    let query = "DELETE FROM ";
    query += table; // Table name
    query += " WHERE id = ?"; // WHERE clause to specify the row by its ID

    // Execute the query using the `run` method to perform the deletion
    this.run(query, [id]);
  }

  // Method to delete rows from a specified table based on a more complex WHERE condition
  static deleteComplex(table, where, whereParams) {
    let query = "DELETE FROM ";
    query += table; // Table name
    query += ` ${where}`; // WHERE clause that can be more complex

    // Execute the query using the `run` method with the provided parameters
    this.run(query, whereParams);
  }

  // Method to delete rows from a specified table based on a specific column value
  static deleteByColumn(id, table, column) {
    let query = "DELETE FROM ";
    query += table; // Table name
    query += ` WHERE ${column} = ?`; // WHERE clause targeting the specific column

    // Execute the query using the `run` method to perform the deletion
    this.run(query, [id]);
  }

  // Method to insert a new row into the specified table
  static create(model, table) {
    const keys = Object.keys(model); // Get column names
    const values = keys.map((key) => model[key]); // Get column values
    const placeholders = Array(keys.length).fill("?").join(", "); // Create placeholders for SQL query
    const query = `INSERT INTO ${table} (${keys.join(", ")}) VALUES (${placeholders})`; // Construct SQL query
    const insertQuery = db.prepare(query);

    const transaction = db.transaction(() => {
      const info = insertQuery.run(values);
    });
    transaction();
  }

  // Method to update an existing row identified by ID in the specified table
  static async update(id, model, table) {
    const keys = Object.keys(model); // Get column names
    const values = keys.map((key) => model[key]); // Get column values
    const setClause = keys.map((key) => `${key} = ?`).join(", "); // Create SET clause for SQL query
    const query = `UPDATE ${table} SET ${setClause} WHERE id = ?`; // Construct SQL query
    const insertQuery = db.prepare(query);

    const transaction = db.transaction(() => {
      const info = insertQuery.run([...values, id]);
    });
    transaction();
  }

  // Method to update rows in the specified table based on a value in a specific column
  static async updateByColumn(value, column, model, table) {
    const keys = Object.keys(model); // Get column names
    const values = keys.map((key) => model[key]); // Get column values
    const setClause = keys.map((key) => `${key} = ?`).join(", "); // Create SET clause for SQL query
    const query = `UPDATE ${table} SET ${setClause} WHERE ${column} = ?`; // Construct SQL query
    const insertQuery = db.prepare(query);

    const transaction = db.transaction(() => {
      const info = insertQuery.run([...values, value]);
    });
    transaction();
  }

  // Method to search for rows in the specified table based on criteria
  static search(criteria, table, customSelect = "*", join = "", whereType = "AND") {
    const conditions = Object.keys(criteria)
      .map((key) => {
        const { value, operator } = criteria[key];
        const conditionOperator = operator === "LIKE" ? "LIKE" : "="; // Handle LIKE operator
        return `${key} ${conditionOperator} ?`; // Build condition
      })
      .join(` ${whereType} `); // Combine conditions with specified logical operator
    const query = `SELECT ${customSelect} FROM ${table} ${join} WHERE ${conditions}`; // Construct SQL query
    const values = Object.values(criteria).map(
      (item) => (item.operator === "LIKE" ? `%${item.value}%` : item.value) // Format values for LIKE operator
    );
    return this.getAllRow(query, values);
  }

  // Method to paginate results from a table
  static paginate(page, pageSize, table, customSelect = "*", join = "", where = "", whereParams = []) {
    const offset = (page - 1) * pageSize; // Calculate offset for pagination
    let query = `SELECT ${customSelect} FROM ${table} ${join} ${where} LIMIT ? OFFSET ?`; // Construct SQL query
    return this.getAllRow(query, [...whereParams, pageSize, offset]);
  }

  // Method to count the number of rows in a table based on a condition
  static count(table, where = "", whereParams = []) {
    let query = `SELECT COUNT(*) as count FROM ${table} ${where}`; // Construct SQL query
    return this.get(query, whereParams);
  }

  // Method to perform bulk updates on multiple models
  static async bulkUpdate(models, table) {
    try {
      await Promise.all(models.map((model) => this.update(model.id, model.data, table))); // Perform all updates
    } catch (err) {
      throw err; // Rethrow error if any update fails
    }
  }

  // Method to perform bulk insertions of multiple models
  static async bulkInsert(models, table) {
    try {
      await Promise.all(models.map((model) => this.create(model, table))); // Perform all insertions
    } catch (err) {
      throw err; // Rethrow error if any insertion fails
    }
  }

  // Method to calculate the sum of a column in a table
  static sum(column, table) {
    const query = `SELECT SUM(${column}) as total FROM ${table}`; // Construct SQL query
    return this.get(query);
  }
}
exports.default = Database;
