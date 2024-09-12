"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
// db/database.ts
const sqlite3_1 = __importDefault(require("sqlite3"));
// Connect to SQLite database (or create a new one if it doesn't exist)
const db = new sqlite3_1.default.Database(path.join(__dirname, "../../database.db"), (err) => {
  if (err) {
    console.error("Error connecting to database:", err.message);
  } else {
    console.log("Connected to SQLite database");
  }
});
// Handle database close operation when the process exits
process.on("exit", () => {
  // Ensure no transaction is in progress
  db.serialize(() => {
    // Close the database connection
    db.close((err) => {
      if (err) {
        console.error("Error closing database:", err.message);
      } else {
        console.log("Closed the database connection");
      }
    });
  });
});
class Database {
  // Method to get a single row from the database based on a query and optional parameters
  static get(query, params = []) {
    return new Promise((resolve, reject) => {
      // Execute the provided query with optional parameters
      db.get(query, params, (err, row) => {
        if (err) {
          // Reject the promise if there's an error
          reject(err);
        } else {
          if (row) {
            // If a row is found, resolve the promise with the result
            resolve(row);
          } else {
            // If no row is found, reject the promise with a "Not Found" message
            reject("Not Found");
          }
        }
      });
    });
  }

  // Method to get all rows that match the query, with optional where parameters
  static getAllRow(query = "", whereParams = []) {
    return new Promise((resolve, reject) => {
      // Execute the query to get multiple rows from the database
      db.all(query, whereParams, (err, row) => {
        if (err) {
          // Reject the promise if there's an error
          reject(err);
        } else {
          // Resolve the promise with the rows returned
          resolve(row);
        }
      });
    });
  }

  // Method to get all rows from a specified table with customizable select fields, joins, and conditions
  static getAll(table, customSelect = "*", join = "", where = "", whereParams = []) {
    return new Promise((resolve, reject) => {
      // Build the SQL query dynamically based on the provided parameters
      let query = `SELECT ${customSelect} FROM `;
      query += table; // Table name
      query += ` ${join}`; // Optional JOIN clause
      query += ` ${where}`; // Optional WHERE clause

      // Execute the query with the provided where parameters
      db.all(query, whereParams, (err, row) => {
        if (err) {
          // Reject the promise if there's an error
          reject(err);
        } else {
          // Resolve the promise with the rows returned
          resolve(row);
        }
      });
    });
  }

  // Method to execute a query that modifies the database (INSERT, UPDATE, DELETE, etc.)
  static run(query, params = []) {
    return new Promise((resolve, reject) => {
      // Run the provided query with optional parameters
      db.run(query, params, function (err) {
        if (err) {
          // Reject the promise if there's an error
          reject(err);
        } else {
          // Resolve the promise when the query completes successfully
          resolve();
        }
      });
    });
  }

  // Method to retrieve a single row by its ID from the specified table
  static getById(id, table, customSelect = "*", join = "") {
    return new Promise(async (resolve, reject) => {
      try {
        // Build the SQL query to select the row by ID, with optional JOINs and custom SELECT fields
        let query = `SELECT ${customSelect} FROM `;
        query += table; // Table name
        query += ` ${join} WHERE id = ?`; // WHERE clause for the ID

        // Execute the query using the `get` method and await the result
        const model = await this.get(query, [id]);

        // Resolve the promise with the retrieved model
        resolve(model);
      } catch (error) {
        // Reject the promise if there's an error
        reject(error);
      }
    });
  }

  // Method to retrieve a single row based on a specific column value from the specified table
  static getByColumn(value, column, table, customSelect = "*", join = "") {
    return new Promise(async (resolve, reject) => {
      try {
        // Build the SQL query to select the row by column, with optional JOINs and custom SELECT fields
        let query = `SELECT ${customSelect} FROM `;
        query += table; // Table name
        query += ` ${join} WHERE ${column} = ?`; // WHERE clause for the specified column

        // Execute the query using the `get` method and await the result
        const model = await this.get(query, [value]);

        // Resolve the promise with the retrieved model
        resolve(model);
      } catch (error) {
        // Reject the promise if there's an error
        reject(error);
      }
    });
  }

  // Method to delete a row from a specified table by its ID
  static deleteById(id, table) {
    return new Promise(async (resolve, reject) => {
      try {
        // Build the DELETE query targeting the row by its ID
        let query = "DELETE FROM ";
        query += table; // Table name
        query += " WHERE id = ?"; // WHERE clause to specify the row by its ID

        // Execute the query using the `run` method to perform the deletion
        await this.run(query, [id]);

        // Resolve the promise once the deletion is complete
        resolve();
      } catch (error) {
        // Reject the promise if there's an error
        reject(error);
      }
    });
  }

  // Method to delete rows from a specified table based on a more complex WHERE condition
  static deleteComplex(table, where, whereParams) {
    return new Promise(async (resolve, reject) => {
      try {
        // Build the DELETE query with a dynamic WHERE condition
        let query = "DELETE FROM ";
        query += table; // Table name
        query += ` ${where}`; // WHERE clause that can be more complex

        // Execute the query using the `run` method with the provided parameters
        await this.run(query, whereParams);

        // Resolve the promise once the deletion is complete
        resolve();
      } catch (error) {
        // Reject the promise if there's an error
        reject(error);
      }
    });
  }

  // Method to delete rows from a specified table based on a specific column value
  static deleteByColumn(id, table, column) {
    return new Promise(async (resolve, reject) => {
      try {
        // Build the DELETE query targeting rows where a specific column matches the provided value
        let query = "DELETE FROM ";
        query += table; // Table name
        query += ` WHERE ${column} = ?`; // WHERE clause targeting the specific column

        // Execute the query using the `run` method to perform the deletion
        await this.run(query, [id]);

        // Resolve the promise once the deletion is complete
        resolve();
      } catch (error) {
        // Reject the promise if there's an error
        reject(error);
      }
    });
  }

  // Method to insert a new row into the specified table
  static create(model, table) {
    return new Promise(async (resolve, reject) => {
      const keys = Object.keys(model); // Get column names
      const values = keys.map((key) => model[key]); // Get column values
      const placeholders = Array(keys.length).fill("?").join(", "); // Create placeholders for SQL query
      const query = `INSERT INTO ${table} (${keys.join(", ")}) VALUES (${placeholders})`; // Construct SQL query
      db.run(query, values, function (err) {
        if (err) {
          reject(err); // Reject promise if error occurs
        } else {
          resolve(); // Resolve promise if insertion is successful
        }
      });
    });
  }

  // Method to update an existing row identified by ID in the specified table
  static async update(id, model, table) {
    return new Promise(async (resolve, reject) => {
      const keys = Object.keys(model); // Get column names
      const values = keys.map((key) => model[key]); // Get column values
      const setClause = keys.map((key) => `${key} = ?`).join(", "); // Create SET clause for SQL query
      const query = `UPDATE ${table} SET ${setClause} WHERE id = ?`; // Construct SQL query
      db.serialize(() => {
        db.run("BEGIN TRANSACTION"); // Begin transaction
        db.run(query, [...values, id], function (err) {
          if (err) {
            db.run("ROLLBACK"); // Rollback transaction if error occurs
            reject(err);
          } else {
            if (this.changes > 0) {
              db.run("COMMIT"); // Commit transaction if update is successful
              resolve();
            } else {
              db.run("ROLLBACK"); // Rollback transaction if no rows are updated
              reject("Not Found");
            }
          }
        });
      });
    });
  }

  // Method to update rows in the specified table based on a value in a specific column
  static async updateByColumn(value, column, model, table) {
    return new Promise(async (resolve, reject) => {
      const keys = Object.keys(model); // Get column names
      const values = keys.map((key) => model[key]); // Get column values
      const setClause = keys.map((key) => `${key} = ?`).join(", "); // Create SET clause for SQL query
      const query = `UPDATE ${table} SET ${setClause} WHERE ${column} = ?`; // Construct SQL query
      db.serialize(() => {
        db.run("BEGIN TRANSACTION"); // Begin transaction
        db.run(query, [...values, value], function (err) {
          if (err) {
            db.run("ROLLBACK"); // Rollback transaction if error occurs
            reject(err);
          } else {
            if (this.changes > 0) {
              db.run("COMMIT"); // Commit transaction if update is successful
              resolve();
            } else {
              db.run("ROLLBACK"); // Rollback transaction if no rows are updated
              reject("Not Found");
            }
          }
        });
      });
    });
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
    return new Promise((resolve, reject) => {
      db.all(query, values, (err, rows) => {
        if (err) {
          reject(err); // Reject promise if error occurs
        } else {
          resolve(rows); // Resolve promise with the retrieved rows
        }
      });
    });
  }

  // Method to paginate results from a table
  static paginate(page, pageSize, table, customSelect = "*", join = "", where = "", whereParams = []) {
    const offset = (page - 1) * pageSize; // Calculate offset for pagination
    let query = `SELECT ${customSelect} FROM ${table} ${join} ${where} LIMIT ? OFFSET ?`; // Construct SQL query
    return new Promise((resolve, reject) => {
      db.all(query, [...whereParams, pageSize, offset], (err, rows) => {
        if (err) {
          reject(err); // Reject promise if error occurs
        } else {
          resolve(rows); // Resolve promise with the retrieved rows
        }
      });
    });
  }

  // Method to count the number of rows in a table based on a condition
  static count(table, where = "", whereParams = []) {
    let query = `SELECT COUNT(*) as count FROM ${table} ${where}`; // Construct SQL query
    return new Promise((resolve, reject) => {
      db.get(query, whereParams, (err, result) => {
        if (err) {
          reject(err); // Reject promise if error occurs
        } else {
          resolve(result.count); // Resolve promise with the count result
        }
      });
    });
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
    return new Promise((resolve, reject) => {
      db.get(query, (err, result) => {
        if (err) {
          reject(err); // Reject promise if error occurs
        } else {
          resolve(result.total); // Resolve promise with the total sum result
        }
      });
    });
  }
}
exports.default = Database;
