"use strict";
exports.__esModule = true;
var Encoder_1 = require("../dist/Dracosis/Encoder");
var THREE = require("three");
var callback = function () {
    console.log("Conversion complete");
};
var renderer = new THREE.WebGLRenderer();
var dracoFileCreator = new Encoder_1["default"](renderer, "obj", "jpg", 1, 4, "final", callback);
