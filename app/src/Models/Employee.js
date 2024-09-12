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
class Employee {
  constructor(id, name, phone, email, address) {
    this.name = name;
    this.phone = phone;
    this.email = email;
    this.address = address;
    this.id = id;
  }
  static async attendreport(employee_id, year, month) {
    try {
      const resutl = DataBase_1.default.getAllRow(
        `WITH CheckIn AS (
    SELECT 
        employee_id, 
        DATE(created_at) AS attendance_date, 
        created_at AS check_in_time
    FROM 
        attendes
    WHERE 
        type = 1 
        AND employee_id = ?
        AND strftime('%Y', created_at) = ?
        AND strftime('%m', created_at) = ?
),
CheckOut AS (
    SELECT 
        employee_id, 
        DATE(created_at) AS attendance_date, 
        created_at AS check_out_time
    FROM 
        attendes
    WHERE 
        type = 0
        AND employee_id = ?
        AND strftime('%Y', created_at) = ?
        AND strftime('%m', created_at) = ?
)
SELECT 
    CheckIn.employee_id,
    CheckIn.attendance_date,
    CheckIn.check_in_time,
    CheckOut.check_out_time,
    (julianday(CheckOut.check_out_time) - julianday(CheckIn.check_in_time)) * 24 * 60 AS minutes_worked
FROM 
    CheckIn
JOIN 
    CheckOut 
ON 
    CheckIn.employee_id = CheckOut.employee_id
    AND CheckIn.attendance_date = CheckOut.attendance_date
ORDER BY 
    CheckIn.attendance_date ASC;
`,
        [employee_id, year, month, employee_id, year, month]
      );
      return resutl;
    } catch (error) {
      throw error;
    }
  }
  static async attendreportAllEmployee(year, month) {
    try {
      const result = DataBase_1.default.getAllRow(
        `WITH CheckIn AS (
                SELECT 
                    employee_id, 
                    DATE(created_at) AS attendance_date, 
                    created_at AS check_in_time
                FROM 
                    attendes
                WHERE 
                    type = 1 
                    AND strftime('%Y', created_at) = ?
                    AND strftime('%m', created_at) = ?
            ),
            CheckOut AS (
                SELECT 
                    employee_id, 
                    DATE(created_at) AS attendance_date, 
                    created_at AS check_out_time
                FROM 
                    attendes
                WHERE 
                    type = 0 
                    AND strftime('%Y', created_at) = ?
                    AND strftime('%m', created_at) = ?
            ),
            DaysPresent AS (
                SELECT 
                    CheckIn.employee_id,
                    CheckIn.attendance_date
                FROM 
                    CheckIn
                JOIN 
                    CheckOut 
                ON 
                    CheckIn.employee_id = CheckOut.employee_id
                    AND CheckIn.attendance_date = CheckOut.attendance_date
                GROUP BY 
                    CheckIn.employee_id, CheckIn.attendance_date
            )
            SELECT 
                e.name AS employee_name,
                COUNT(DISTINCT dp.attendance_date) AS days_present,
                ? - COUNT(DISTINCT dp.attendance_date) AS days_absent
            FROM 
                ${Constants_1.EMPLOYEE_TABLE} e
            LEFT JOIN 
                DaysPresent dp ON e.id = dp.employee_id
            GROUP BY 
                e.id;
            `,
        [year, month, year, month, new Date(year, month, 0).getDate()]
      );
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Method to record attendance for an employee with a unique ID and type
  static async attend(employee_id, type) {
    try {
      console.log(type);

      const uniqueId = Snowflake_1.default.nextId(); // Generate a unique ID
      await DataBase_1.default.create({ employee_id, id: uniqueId.toString(), type }, Constants_1.ATTENDENT_TABLE); // Insert attendance record
      return uniqueId.toString(); // Return the unique ID
    } catch (error) {
      throw error; // Rethrow error if insertion fails
    }
  }

  // Method to create a new employee with a unique ID, ensuring the name is not already used
  static async create(name, phone, email, address) {
    try {
      const count = await DataBase_1.default.count(Constants_1.EMPLOYEE_TABLE, "WHERE name = ?", [name]); // Check if the name is already used
      if (count > 0) throw "name already used"; // Throw an error if the name is already used
      const uniqueId = Snowflake_1.default.nextId(); // Generate a unique ID
      await DataBase_1.default.create({ name, id: uniqueId.toString(), phone, email, address }, Constants_1.EMPLOYEE_TABLE); // Insert new employee record
      return uniqueId.toString(); // Return the unique ID
    } catch (error) {
      throw error; // Rethrow error if creation fails
    }
  }

  // Method to update an existing employee's details
  static async update(id, phone, email, address, name) {
    try {
      const user = await this.getById(id); // Retrieve the existing employee record
      await DataBase_1.default.update(id, { phone, email, address, name }, Constants_1.EMPLOYEE_TABLE); // Update employee record
    } catch (error) {
      throw error; // Rethrow error if update fails
    }
  }

  // Method to search for employees by name or ID using a keyword
  static async search(keyword) {
    try {
      const user = await DataBase_1.default.getAll(Constants_1.EMPLOYEE_TABLE, "*", "", "WHERE name LIKE ? OR id LIKE ?", [
        "%" + keyword + "%",
        "%" + keyword + "%",
      ]); // Search for employees matching the keyword
      return user; // Return the search results
    } catch (error) {
      throw error; // Rethrow error if search fails
    }
  }

  // Method to get an employee by ID
  static async getById(id) {
    try {
      const user = await DataBase_1.default.getById(id, Constants_1.EMPLOYEE_TABLE); // Retrieve employee record by ID
      return user; // Return the employee record
    } catch (error) {
      throw error; // Rethrow error if retrieval fails
    }
  }

  // Method to get paginated list of employees and the total number of pages
  static async getEmployees(page) {
    try {
      const Employees = await DataBase_1.default.paginate(page, Constants_1.PAGE_SIZE, Constants_1.EMPLOYEE_TABLE); // Get paginated employee records
      const count = await DataBase_1.default.count(Constants_1.EMPLOYEE_TABLE); // Get total count of employees
      return { Employees, pages: Math.ceil(count / Constants_1.PAGE_SIZE) }; // Return employees and total number of pages
    } catch (error) {
      throw error; // Rethrow error if retrieval fails
    }
  }

  // Method to delete an employee record by ID
  static async delete(id) {
    try {
      await DataBase_1.default.deleteById(id, Constants_1.EMPLOYEE_TABLE); // Delete employee record by ID
    } catch (error) {
      throw error; // Rethrow error if deletion fails
    }
  }
}
exports.default = Employee;
