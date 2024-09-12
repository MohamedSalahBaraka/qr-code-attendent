"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const DataBase_1 = __importDefault(require("../DataBaseBetter"));
const Snowflake_1 = __importDefault(require("../Snowflake"));
const Constants_1 = require("../Constants");
class User {
  constructor(id, username, password) {
    this.username = username;
    this.password = password;
    this.id = id;
  }

  // Method to create a new user with a unique ID, ensuring the username is not already used
  static async create(username, password) {
    try {
      const count = await DataBase_1.default.count(Constants_1.USER_TABLE, "WHERE username = ?", [username]); // Check if the username is already used
      if (count > 0) throw "username already used"; // Throw an error if the username is already used
      const uniqueId = Snowflake_1.default.nextId(); // Generate a unique ID
      await DataBase_1.default.create({ username, id: uniqueId.toString(), password }, Constants_1.USER_TABLE); // Insert new user record
      return uniqueId.toString(); // Return the unique ID
    } catch (error) {
      throw error; // Rethrow error if creation fails
    }
  }

  // Method to retrieve a user by their token
  static async getByToken(token) {
    try {
      const rows = await DataBase_1.default.getAll("tokens t", "u.* ", `JOIN ${Constants_1.USER_TABLE} u ON u.id = t.user_id`, "WHERE t.token = ?", [
        token,
      ]); // Join tokens and users tables to get user by token
      const row = rows[0]; // Get the first result
      if (row) return row; // Return the user if found
      throw new Error("not found"); // Throw an error if no user is found
    } catch (error) {
      throw error; // Rethrow error if retrieval fails
    }
  }

  // Method to update an existing user's details, ensuring the new username is not already used
  static async update(id, password, username) {
    try {
      const user = await this.getById(id); // Retrieve the existing user record
      const otherusers = await this.getByusername(username); // Check for other users with the same username
      if (otherusers.length > 1) throw "username is used"; // Throw an error if multiple users have the same username
      if (otherusers.length === 1 && otherusers[0].id !== user.id) throw "username is used"; // Throw an error if the username is already used by another user
      await DataBase_1.default.update(id, { password, username }, Constants_1.USER_TABLE); // Update user record
    } catch (error) {
      throw error; // Rethrow error if update fails
    }
  }

  // Method to retrieve users by username
  static async getByusername(username) {
    try {
      const user = await DataBase_1.default.getAll(Constants_1.USER_TABLE, "*", "", "WHERE username = ?", [username]); // Retrieve users with the specified username
      return user; // Return the users found
    } catch (error) {
      throw error; // Rethrow error if retrieval fails
    }
  }

  // Method to search for users by username or ID using a keyword
  static async search(keyword) {
    try {
      const user = await DataBase_1.default.getAll(Constants_1.USER_TABLE, "*", "", "WHERE username LIKE ? OR id LIKE ?", [
        "%" + keyword + "%",
        "%" + keyword + "%",
      ]); // Search for users matching the keyword
      return user; // Return the search results
    } catch (error) {
      throw error; // Rethrow error if search fails
    }
  }

  // Method to retrieve a user by ID
  static async getById(id) {
    try {
      const user = await DataBase_1.default.getById(id, Constants_1.USER_TABLE); // Retrieve user record by ID
      return user; // Return the user record
    } catch (error) {
      throw error; // Rethrow error if retrieval fails
    }
  }

  // Method to get paginated list of users and the total number of pages
  static async getusers(page) {
    try {
      const users = await DataBase_1.default.paginate(page, Constants_1.PAGE_SIZE, Constants_1.USER_TABLE); // Get paginated user records
      const count = await DataBase_1.default.count(Constants_1.USER_TABLE); // Get total count of users
      return { users, pages: Math.ceil(count / Constants_1.PAGE_SIZE) }; // Return users and total number of pages
    } catch (error) {
      throw error; // Rethrow error if retrieval fails
    }
  }

  // Method to delete a user record by ID
  static async delete(id) {
    try {
      await DataBase_1.default.deleteById(id, Constants_1.USER_TABLE); // Delete user record by ID
    } catch (error) {
      throw error; // Rethrow error if deletion fails
    }
  }

  static async login(username, password) {
    try {
      console.log("Login...", DataBase_1.default);
      const rows = await DataBase_1.default.getAll(Constants_1.USER_TABLE, "*", "", "WHERE username = ?", [username]);
      const row = rows[0];
      console.log("Login...");
      if (!row) throw new Error("username not found");
      // const isPasswordValid = await bcrypt.compare(password, row.password);
      const isPasswordValid = password === row.password;
      if (isPasswordValid) {
        // Password is correct, generate a token
        const token = Snowflake_1.default.nextId();
        // Store the token in the tokens table
        console.log("Login...");
        await DataBase_1.default.create({ user_id: row.id, token }, "tokens");
        console.log("Login...");
        return { token, user: row };
      } else {
        throw new Error("Incorrect password");
      }
    } catch (error) {
      throw error;
    }
  }
  static async logout(tokenId) {
    try {
      await DataBase_1.default.deleteByColumn(tokenId, "tokens", "token");
      return Promise.resolve();
    } catch (err) {
      throw err;
    }
  }
}
exports.default = User;
