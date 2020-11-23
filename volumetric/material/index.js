const fs = require("fs");
const { printOutput, formatFolderpath } = require("../shared");

materialUtility = function (args) {
  if (args["textureFile"]) {
    var gltfFile = args["gltfFile"];
    var textureFile = args["textureFile"];
    var outputFile = args["outputFile"];
    var outputFolder = formatFolderpath(args["outputFolder"]);
    var materialAssign = require("./materialAssign");
    materialAssign(textureFile, gltfFile, outputFolder, outputFile, function (
      meshes
    ) {
      printOutput("meshes", meshes);
    });
  }

  if (args["textureFolder"]) {
    var gltfFolder = args["gltfFolder"];
    var textureFolder = args["textureFolder"];
    var outputFolder = formatFolderpath(args["outputFolder"]);
    fs.readdir(gltfFolder, function (err, files) {
      //handling error
      if (err) console.log(err);
      else {
        files.forEach((file) => {
          var gltfFile = gltfFolder + file;
          var textureFile =
            textureFolder + "/tex." + file.split(".")[1] + ".jpg";
          var outputFile = "textured." + file.split(".")[1] + ".gltf";
          var materialAssign = require("./materialAssign");
          materialAssign(
            textureFile,
            gltfFile,
            outputFolder,
            outputFile,
            function (meshes) {
              printOutput("meshes", meshes);
            }
          );
        });
      }
    });
  }
};

module.exports = materialUtility;
