const { contextBridge, ipcRenderer } = require("electron");

// Expose a bridge between the main process and renderer process for secure IPC communication
contextBridge.exposeInMainWorld("app", {
  // User-related API methods
  user: {
    // Retrieve users with pagination
    get: (page) => ipcRenderer.invoke("get-users", page),
    // Create a new user
    create: (username, password) => ipcRenderer.invoke("create-user", username, password),
    // Update an existing user
    update: (id, password, username) => ipcRenderer.invoke("update-user", id, password, username),
    // Delete a user by ID
    delete: (id) => ipcRenderer.invoke("delete-user", id),
    // Authenticate a user by username and password
    login: (username, password) => ipcRenderer.invoke("login-user", username, password),
    // Search for users by keyword
    search: (keyword) => ipcRenderer.invoke("search-user", keyword),
  },
  // Employee-related API methods
  employee: {
    // Retrieve employees with pagination
    get: (page) => ipcRenderer.invoke("get-employees", page),
    // Create a new employee
    create: (name, phone, email, address) => ipcRenderer.invoke("create-employee", name, phone, email, address),
    // Update an existing employee
    update: (id, phone, email, address, name) => ipcRenderer.invoke("update-employee", id, phone, email, address, name),
    // Delete an employee by ID
    delete: (id) => ipcRenderer.invoke("delete-employee", id),
    // Search for employees by keyword
    search: (keyword) => ipcRenderer.invoke("search-employee", keyword),
    // Mark an employee's attendance
    attend: (id, type) => ipcRenderer.invoke("attend-employee", id, type),
    // Generate an attendance report for a specific employee
    attendreport: (employee_id, year, month) => ipcRenderer.invoke("attendreport-employee", employee_id, year, month),
    // Generate an attendance report for all employees
    attendreportAllEmployee: (year, month) => ipcRenderer.invoke("attendreportAllEmployee-employee", year, month),
  },
});
contextBridge.exposeInMainWorld("sqlite", {
  personDB: () => ipcRenderer.invoke("person"),
});
