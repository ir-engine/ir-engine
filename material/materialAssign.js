const fs = require("fs");
const { getContentTypeForType } = require("../shared");
const imageToBase64 = require("image-to-base64");

materialAssign = function (
  texFile,
  gltfFile,
  outputFolder,
  assignedFileName,
  callback
) {
  var assignedPath = outputFolder + assignedFileName;
  getMaterialJSON(texFile, function (materialJson) {
    var gltf = JSON.parse(fs.readFileSync(gltfFile, "utf-8"));
    gltf.materials = materialJson.materials;
    gltf.samplers = materialJson.samplers;
    gltf.textures = materialJson.textures;
    gltf.images = materialJson.images;
    for (var ix = 0; ix < gltf.meshes.length; ix++) {
      var mesh = gltf.meshes[ix];
      for (var jx = 0; jx < mesh.primitives.length; jx++) {
        var primitive = mesh.primitives[jx];
        primitive.material = 0;
      }
    }
    fs.writeFileSync(assignedPath, Buffer.from(JSON.stringify(gltf, null, 2)));
    callback({
      reference: assignedFileName.split(".gltf")[0],
      assets: [
        {
          type: "gltf",
          uri: assignedPath,
          content_type: getContentTypeForType("gltf"),
        },
      ],
    });
  });
};

getMaterialJSON = function (texFile, callback) {
  imageToBase64(texFile) // you can also to use url
    .then((response) => {
      const uri = "data:image/jpeg;base64," + response;
      var materialJson = {
        materials: [
          {
            pbrMetallicRoughness: {
              metallicFactor: 0,
              roughnessFactor: 1,
              baseColorTexture: {
                index: 0,
              },
            },
          },
        ],
        samplers: [
          {
            magFilter: 9729,
            minFilter: 9729,
            wrapS: 33071,
            wrapT: 33071,
          },
        ],
        textures: [
          {
            sampler: 0,
            source: 0,
          },
        ],
        images: [
          {
            mimeType: "image/jpeg",
            uri: uri,
          },
        ],
      };

      callback(materialJson);
    })
    .catch((error) => {
      console.log(error); //Exepection error....
    });
};

module.exports = materialAssign;

/*

materialJson = {
  "materials": [{
    ...
  }],
  "samplers": [{
    ...
  }],
  "textures": [{
    ...
  }],
  "images": [{
    ...
  }]

}

samplers are standalone
images are standalone
textures reference samplers and images
materials reference textures
  

*/
