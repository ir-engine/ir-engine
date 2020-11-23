const util = require('util');
const camelCase = require('camelcase');

function assertRequiredArgs(cmd) {
  const ommittedRequiredParameters = [];
  if (cmd.options) {
    cmd.options.forEach((option) => {
      const name = option.long.slice(2);
      if (option.required && !cmd.hasOwnProperty(camelCase(name))) {
        ommittedRequiredParameters.push(option.flags);
      }
    });
  }

  if (ommittedRequiredParameters.length !== 0) {
    console.error();
    console.error(`The following required parameters were ommitted: ${ommittedRequiredParameters.join(' ; ')}`);
    console.error();
    process.exit(1);
  }
};

function formatFolderpath(folderPath) {
  if ( folderPath && folderPath[folderPath.length-1] != '/') {
    folderPath = folderPath + '/';
  }
  return folderPath;
};

function findAssetOfType(assets, type) {
  if ( !Array.isArray(assets) ) {
    return;
  }
  for (var ix = 0; ix < assets.length; ix++) {
    var asset = assets[ix];
    if (asset.type == type) {
      return asset
    }
  }
};

function getContentTypeForType(type) {
  if (!type) {
    return;
  }
  switch ( type.toLowerCase() ) {
    case 'gltf':
      return 'model/gltf+json';
    case 'glb':
      return 'model/gltf-binary';
    case 'bin':
      return 'application/octet-stream'
    case 'obj':
      return 'text/plain';
    case 'png':
      return 'image/png';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    default:
      return undefined;
  }
}


function printOutput(type, content) {
  enableLog();
  switch(type) {
    case 'error':
      console.error(JSON.stringify({
        'status': type,
        'errors': [{
          'name': content.name,
          'message': content.message,
          'type': content.type,
          'code': content.code,
          'errno': content.errno,
          'stack': content.stack
        }]
      }, null, 2));
      break;
    case 'meshes':
      console.log(JSON.stringify({
        'status': 'success',
        [type]: content
      }, null, 2));
      break;
  }
};

function disableLog() {
  console.disabledError = console.error;
  console.error = function(message) {
    if (message) {
      throw new Error( util.format.apply(util.format, Array.prototype.slice.call(arguments)) )
    }
  };
  console.disabledLog = console.log;
  console.log = function(){};
};

function enableLog() {
  if (console.disabledLog) {
    console.log = console.disabledLog;
  }
  if (console.disabledError) {
    console.error = console.disabledError;
  }
};



module.exports = { printOutput, assertRequiredArgs, formatFolderpath, findAssetOfType, getContentTypeForType, disableLog, enableLog };