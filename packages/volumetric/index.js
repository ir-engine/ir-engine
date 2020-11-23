#!/usr/bin/env node

var pjson = require('./package.json');
const { assertRequiredArgs, printOutput, disableLog } = require('./shared');
var program = require('commander');
const path = require('path');
const fs = require('fs');

const directoryPath = path.join(__dirname, './../assets/gltf');
console.log(directoryPath);

function getFileList() {
  //passsing directoryPath and callback function
  fs.readdir(directoryPath, function (err, files) {
    //handling error
    if (err) 
      console.log(err); 
    else { 
      console.log("\nCurrent directory filenames:"); 
      files.forEach(file => { 
        console.log(file); 
      }) 
    } 
  });
}

// node index.js gltf-texturize-file -o . --gltf-file mesh.00001.gltf --texture-file tex.00001.jpg --output-file mesh_texturized3.gltf
program
  .command('gltf-texturize-file')
  .option('-o, --output-folder <output-folder>', '[required] output folder for generated file(s)')
  .option('--gltf-file [input-file-name]', '[required] gltf file to texturize')
  .option('--output-file [output-file-name]', 'output file name')
  .option('--texture-file [texture-file-name]', '[required] texture file')
  .action(function(cmd) {
    assertRequiredArgs(cmd);
    require('./material')(cmd);
  });

// node index.js gltf-texturize-folder -o ./assets/textured/ --gltf-folder ./assets/gltf/ --texture-folder ./assets/textures/  
program
  .command('gltf-texturize-folder')
  .option('-o, --output-folder <output-folder>', '[required] output folder for generated file(s)')
  .option('--gltf-folder [input-folder-name]', '[required] gltf folder having gltf files')
  .option('--texture-folder [texture-folder-name]', '[required] texture folder having texture files')
  .action(function(cmd) {
    assertRequiredArgs(cmd);
    require('./material')(cmd);
  });

// node index gltf-merge -o . --merged-file combined_ruvi.gltf -i ./assets/textured/
program
  .command('gltf-merge')
  .option('-o, --output-folder <output-folder>', '[required] output folder for generated file(s)')
  .option('--merged-file [merged-file-name]', 'merge the list of passed-in gltf files (optional output name, defaults to merged.gltf)')
  .option('-i, --input-folder [input-folder-name]', 'folder containing the gltf files to merge')
  .action(function(cmd) {
    assertRequiredArgs(cmd);
    require('./gltf')(cmd);
  });

// node index.js gltf-optimize -o . --input-file ruvi_combined.gltf --output-file ruvi_optimized.glb --gltf-binary --gltf-draco-compression  
program
  .command('gltf-optimize')
  .option('-o, --output-folder <output-folder>', '[required] output folder for generated file(s)')
  .option('--input-file [input-file-name]', '[required] gltf file to compress')
  .option('--output-file [output-file-name]', 'output file name')
  .option('--gltf-binary', 'create .glb file(s) instead of .gltf')
  .option('--gltf-draco-compression', 'enable draco compression for meshes')
  .action(function(cmd) {
    assertRequiredArgs(cmd);
    require('./gltf')(cmd);
});



// error on unknown commands
program.on('command:*', function () {
  console.error('Invalid command: %s\nSee --help for a list of available commands.', program.args.join(' '));
  process.exit(1);
});

// program.parse(process.argv);

try {
  // disableLog();
  program.parse(process.argv);
  
} catch (error) {
  printOutput('error', error);
}
