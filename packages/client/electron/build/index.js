"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const electron_2 = require("@capacitor-community/electron");
// The MainWindow object can be accessed via myCapacitorApp.getMainWindow()
const myCapacitorApp = electron_2.createCapacitorElectronApp();
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some Electron APIs can only be used after this event occurs.
electron_1.app.on("ready", () => {
    myCapacitorApp.init();
});
// Quit when all windows are closed.
electron_1.app.on("window-all-closed", function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== "darwin") {
        electron_1.app.quit();
    }
});
electron_1.app.on("activate", function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (myCapacitorApp.getMainWindow().isDestroyed())
        myCapacitorApp.init();
});
// Define any IPC or other custom functionality below here
