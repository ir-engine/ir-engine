const gltfPipeline = require('gltf-pipeline');
const fsExtra = require('fs-extra');
const { formatFolderpath, getContentTypeForType } = require('../shared');

function gltfOptimize(inputFile, args) {
  var gltfPromises = [];
    var reference = inputFile.split('/').pop().split('.gltf')[0];
    var gltf = {
      'reference': reference,
      'assets': []
    };
    gltfPromises.push(gltfOptimizeOne(inputFile, gltf, args));
    return gltfPromises;
};

function gltfOptimizeOne(inputFile, gltfObject, args) {
  var gltf = fsExtra.readJsonSync(inputFile);
  var inputFilePathSplit = inputFile.split('/');
  var outputName = typeof(args['outputFile']) === "boolean" ? 'optimized.glb' : args['outputFile'];
  var inputFileFolder = formatFolderpath(inputFilePathSplit.join('/'));
  var outputFolder = formatFolderpath(args['outputFolder']);
  var options = {
    resourceDirectory: inputFileFolder,
    name: outputName,
    dracoOptions: args['gltfDracoCompression'] ? {} : undefined
  };
  
  var pipelineFunction = gltfPipeline.gltfToGlb;
  var writer = function(results) {
    fsExtra.writeFileSync(outputFolder + outputName, results.glb);
    return {
      'type': 'glb',
      'uri': outputFolder + outputName,
      'content_type': getContentTypeForType('glb')
    }
  };

  return pipelineFunction(gltf, options).then(function(results) {
    var createdAssets = [];
    createdAssets.push(writer(results));
    return createdAssets;
  }).then(function(createdAssets) {
    return new Promise(function(resolve, reject) {
      gltfObject.assets = gltfObject.assets.concat(createdAssets);
      resolve(gltfObject);
    });
  }).catch(function(error){
    console.log(error);
  });
};


module.exports = gltfOptimize;