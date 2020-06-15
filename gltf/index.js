const { printOutput } = require('../shared');

gltfUtility = function(args) {
  if (args['mergedFile']) {
    var gltfMerge = require('./gltfMerge');
    var inputFolder = args['inputFolder'];
    gltfMerge(inputFolder, args, function(meshes) {
      printOutput('meshes', meshes);
    });
  }

  if (args['gltfBinary']) {
    var gltfOptimize = require('./gltfOptimize');
    var inputFile = args['inputFile'];
    var meshes = gltfOptimize(inputFile, args);
    if (meshes) {
      Promise.all(meshes).then(function(meshes) {
        printOutput('meshes', meshes);
      });
    }
  }

};

module.exports = gltfUtility;
