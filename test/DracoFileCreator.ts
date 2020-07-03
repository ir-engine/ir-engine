import DracoFileCreator from "../dist/Dracosis/Encoder";
import * as THREE from "three";

var callback = function () {
  console.log("Conversion complete");
};
var renderer = new THREE.WebGLRenderer();
var dracoFileCreator = new DracoFileCreator(
  renderer,
  "obj",
  "jpg",
  1,
  4,
  "final",
  callback
);
