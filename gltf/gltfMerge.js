const fs = require('fs');
const { formatFolderpath, getContentTypeForType } = require('../shared');

function gltfMerge(gltfFolderPath, args, callback) {
  var mergedFileName = typeof(args['mergedFile']) === "boolean" ? 'merged.gltf' : args['mergedFile'];
  var mergedName = mergedFileName.split('.gltf')[0];
  var outputFolder = formatFolderpath(args['outputFolder']);
  var outputFilePath = outputFolder + mergedFileName;
  var merged;

  fs.readdir(gltfFolderPath, function (err, files) {
    //handling error
    if (err) 
      console.log(err); 
    else { 
      files.forEach(file => { 
        var filePath = gltfFolderPath + file;
        var gltf = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        merged = mergeIntoGltfFile(merged, gltf);
      }) 
    } 
    var prettyGltf = JSON.stringify(merged, null, 2);
    var fileData = Buffer.from(prettyGltf);
    fs.writeFileSync(outputFilePath, fileData); // writes the merged.gtlf file

    callback( {
      'reference': mergedName,
      'assets': [{
        'type': 'gltf',
        'uri': outputFilePath,
        'content_type': getContentTypeForType('gltf')
      }]
    });
  });
  
};

// samplers are standalone
// images are standalone
// textures reference samplers and images
// materials reference textures

function updateMergingGltfAttribute(containerObject, attributePath, increment) {
  if (!containerObject || !attributePath || !attributePath.length || !increment) {
    return;
  }
  var object = containerObject;
  var attributeName = attributePath[attributePath.length-1];
  for (var ix = 0; ix < attributePath.length-1; ix++ ) {
    if (object[attributePath[ix]]) {
      object = object[attributePath[ix]];
    } else {
      return;
    }
  }
  if (object[attributeName]) {
    object[attributeName] += increment;
  } else {
    object[attributeName] = increment;
  }
};

function mergeAttribute(existingGltf, toMerge, key, subPaths, existingCount) {
  var toMergeValues = toMerge[key] || [];
  console.log("65");
  console.log(key);
  console.log(toMergeValues);
  for (var ix = 0; ix < toMergeValues.length; ix++) {
    var value = toMergeValues[ix];
    for (var jx = 0; jx < subPaths.length; jx++) {
      updateMergingGltfAttribute(value, subPaths[jx], existingCount);
    }
    if (!existingGltf[key]) {
      existingGltf[key] = [];
    }
    existingGltf[key].push(value);
  }
};

function mergeIntoGltfFile(existingGltf, toMerge) {
  if (!existingGltf) {
    return toMerge;
  }
  var existingBufferCount = existingGltf['buffers'] ? existingGltf['buffers'].length : 0;
  var existingBufferViewCount = existingGltf['bufferViews'] ? existingGltf['bufferViews'].length : 0;
  var existingAccessorCount = existingGltf['accessors'] ? existingGltf['accessors'].length : 0;
  var existingMeshCount = existingGltf['meshes'] ? existingGltf['meshes'].length : 0;
  var existingNodeCount = existingGltf['nodes'] ? existingGltf['nodes'].length : 0;
  var existingSamplerCount = existingGltf['samplers'] ? existingGltf['samplers'].length : 0;
  var existingImageCount = existingGltf['images'] ? existingGltf['images'].length : 0;
  var existingTextureCount = existingGltf['textures'] ? existingGltf['textures'].length : 0;
  var existingMaterialCount = existingGltf['materials'] ? existingGltf['materials'].length : 0;

  // merge material data
  if (toMerge['samplers']) {
    existingGltf['samplers'] = (existingGltf['samplers'] || []).concat(toMerge['samplers']);
  }
  if (toMerge['images']) {
    existingGltf['images'] = (existingGltf['images'] || []).concat(toMerge['images']);
  }

  var toMergeTextures = toMerge['textures'] || [];
  for (var ix = 0; ix < toMergeTextures.length; ix++) {
    var texture = toMergeTextures[ix];
    updateMergingGltfAttribute(texture, ['sampler'], existingSamplerCount);
    updateMergingGltfAttribute(texture, ['source'], existingImageCount);
    if (!existingGltf['textures']) {
      existingGltf['textures'] = [];
    }
    existingGltf['textures'].push(texture);
  }

  mergeAttribute(existingGltf, toMerge, 'materials', [['pbrMetallicRoughness', 'baseColorTexture', 'index'], ['pbrMetallicRoughness', 'metallicRoughnessTexture', 'index'], ['emissiveTexture', 'index'], ['normalTexture', 'index'], ['occlusionTexture', 'index']], existingTextureCount);

  // merge gemometry data
  if (toMerge['buffers']) {
    existingGltf['buffers'] = (existingGltf['buffers'] || []).concat(toMerge['buffers']);
  }

  mergeAttribute(existingGltf, toMerge, 'bufferViews', [['buffer']], existingBufferCount);
  mergeAttribute(existingGltf, toMerge, 'accessors', [['bufferView']], existingBufferViewCount);


  var toMergeMeshes = toMerge['meshes'] || [];
  for (var ix = 0; ix < toMergeMeshes.length; ix++) {
    var mesh = toMergeMeshes[ix];
    var primitives = mesh.primitives || [];
    for (var jx = 0; jx < primitives.length; jx++) {
      var primitive = primitives[jx];
      var attributes = primitive.attributes || {};
      for (var key in attributes) {
        updateMergingGltfAttribute(attributes, [key], existingAccessorCount);
      }
      updateMergingGltfAttribute(primitive, ['indices'], existingAccessorCount);
      updateMergingGltfAttribute(primitive, ['material'], existingMaterialCount);
    }
    if (!existingGltf['meshes']) {
      existingGltf['meshes'] = [];
    }
    existingGltf['meshes'].push(mesh);
  }

  mergeAttribute(existingGltf, toMerge, 'nodes', [['mesh']], existingMeshCount);

  if (!existingGltf['scenes']) {
    existingGltf['scenes'] = [];
  }
  var existingGltfScenes = existingGltf['scenes'];
  var toMergeScenes = toMerge['scenes'] || [];
  for (var ix = 0; ix < toMergeScenes.length; ix++) {
    var scene = toMergeScenes[ix];
    if (!scene['nodes']) {
      scene['nodes'] = [];
    }
    var sceneNodes = scene['nodes'];
    for (var jx = 0; jx < sceneNodes.length; jx++) {
      sceneNodes[jx] += existingNodeCount;
    }
    if (ix < existingGltfScenes.length) {
      var existingScene = existingGltfScenes[ix];
      if (!existingScene['nodes']) {
        existingScene['nodes'] = [];
      }
      console.log(sceneNodes);
      existingScene['nodes'] = existingScene['nodes'].concat(sceneNodes);
    } else {
      existingGltfScenes.push(scene);
    }
  }
  return existingGltf;
};

module.exports = gltfMerge;
