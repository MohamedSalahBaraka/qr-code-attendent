const { app, BrowserWindow } = require("electron");
const { ipcMain } = require("electron");
const path = require("path");
const url = require("url");
const user = require("./src/Models/User");
const employee = require("./src/Models/Employee");
const personDB = require("./src/PersonManager");

async function createMainWindow() {
  const mainWindow = new BrowserWindow({
    title: "QR-code Attending System",
    width: 1000,
    height: 600,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false, // Security: Keep this false
      preload: path.join(__dirname, "./preload.js"), // Preload script for secure IPC
    },
  });
  mainWindow.maximize();
  // Open DevTools in development mode
  // mainWindow.webContents.openDevTools();
  // mainWindow.loadURL("http://localhost:3000"); // Development server

  const startUrl = path.join(__dirname, "./app/build/index.html");
  mainWindow.loadFile(startUrl).catch((err) => {
    console.error("Error loading file:", err);
  });
  mainWindow.removeMenu();
  mainWindow.webContents.on("did-finish-load", () => {
    mainWindow.webContents.send("loaded");
  });
}

app.whenReady().then(createMainWindow);

// Handle app events to ensure correct behavior across platforms
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// Ensure the main window is created when the app is activated
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

// Handle the "get-users" IPC call to retrieve paginated users
ipcMain.handle("get-users", async (event, page) => {
  return await user.default.getusers(page);
});

// Handle the "create-user" IPC call to create a new user
ipcMain.handle("create-user", async (event, username, password) => {
  return await user.default.create(username, password);
});

// Handle the "update-user" IPC call to update an existing user
ipcMain.handle("update-user", async (event, id, password, username) => {
  return await user.default.update(id, password, username);
});

// Handle the "search-user" IPC call to search for users by ID or username
ipcMain.handle("search-user", async (event, id) => {
  return await user.default.search(id);
});

// Handle the "delete-user" IPC call to delete a user by ID
ipcMain.handle("delete-user", async (event, id) => {
  return await user.default.delete(id);
});

// Handle the "login-user" IPC call to authenticate a user by username and password
ipcMain.handle("login-user", async (event, username, password) => {
  return await user.default.login(username, password);
});

// Handle the "get-employees" IPC call to retrieve paginated employees
ipcMain.handle("get-employees", async (event, page) => {
  return await employee.default.getEmployees(page);
});

// Handle the "create-employee" IPC call to create a new employee
ipcMain.handle("create-employee", async (event, name, phone, email, address) => {
  return await employee.default.create(name, phone, email, address);
});

// Handle the "update-employee" IPC call to update an existing employee
ipcMain.handle("update-employee", async (event, id, phone, email, address, name) => {
  return await employee.default.update(id, phone, email, address, name);
});

// Handle the "delete-employee" IPC call to delete an employee by ID
ipcMain.handle("delete-employee", async (event, id) => {
  return await employee.default.delete(id);
});

// Handle the "search-employee" IPC call to search for employees by ID or name
ipcMain.handle("search-employee", async (event, id) => {
  return await employee.default.search(id);
});

// Handle the "attend-employee" IPC call to mark an employee's attendance
ipcMain.handle("attend-employee", async (event, id, type) => {
  return await employee.default.attend(id, type);
});

// Handle the "attendreport-employee" IPC call to generate an attendance report for a specific employee
ipcMain.handle("attendreport-employee", async (event, employee_id, year, month) => {
  return await employee.default.attendreport(employee_id, year, month);
});

// Handle the "attendreportAllEmployee-employee" IPC call to generate an attendance report for all employees
ipcMain.handle("attendreportAllEmployee-employee", async (event, year, month) => {
  return await employee.default.attendreportAllEmployee(year, month);
});
ipcMain.handle("person", async (event) => {
  return await personDB.readAllPerson();
});
