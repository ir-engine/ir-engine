import { LoadingManager } from 'three';
import { GLTFLoader } from "../assets/loaders/gltf/GLTFLoader";
import { FBXLoader } from "../assets/loaders/fbx/FBXLoader";
// import { GLTFExporter } from "@xr3ngine/engine/src/assets/loaders/gltf/GLTFExporter";
import GLTFExporter from 'three-gltf-exporter';
import { clone } from './vrarmik/SkeletonUtils';

const _getFileType = filename => {
  if (/\.(?:gltf|glb|vrm)$/.test(filename)) {
    return 'gltf';
  } else if (/\.fbx$/.test(filename)) {
    return 'fbx';
  } else if (/\.(?:tar\.gz|tgz|unitypackage)$/.test(filename)) {
    return 'tgz';
  } else if (/\.(?:zip)$/.test(filename)) {
    return 'zip';
  } else if (/\.(?:png|jpe?g)/) {
    return 'img';
  } else {
    return null;
  }
};
const _patchModel = model => {
  model.scene.traverse(o => {
    if (o.isMesh) {
      const materials = Array.isArray(o.material) ? o.material : [o.material];
      for (let i = 0; i < materials.length; i++) {
        const material = materials[i];
        if (material.map && !material.map.image) {
          material.map = null;
        }
      }
    }
  });

  const saved = clone(model.scene);
  model.export = () => new Promise((accept, reject) => {
    new GLTFExporter().parse(saved, ab => {
      accept(ab);
    }, {
      binary: true,
    });
  });
};
const _makeManager = () => {
  const manager = new LoadingManager();
  const managerLoadPromise = _makeManagerLoadPromise(manager);
  return {
    manager,
    managerLoadPromise,
  };
};
const _makeManagerLoadPromise = manager => {
  let accept, reject;
  const p = new Promise((a, r) => {
    accept = a;
    reject = r;
  });
  manager.onLoad = () => {
    accept();
  };
  return p;
};
const loadModelUrl = async (href, filename = href) => {
  const fileType = _getFileType(filename);
  if (fileType === 'gltf') {
    const {manager, managerLoadPromise} = _makeManager();
    const model = await new Promise((accept, reject) => {
      new GLTFLoader(manager).load(href, accept, xhr => {}, reject);
    });
    await managerLoadPromise;
    _patchModel(model);
    return model;
  } else if (fileType === 'fbx') {
    const {manager, managerLoadPromise} = _makeManager();
    const model = await new Promise((accept, reject) => {
      new FBXLoader(manager).load(href, scene => {
        accept({scene});
      }, xhr => {}, reject);
    });
    await managerLoadPromise;
    _patchModel(model);
    return model;
  } else {
    throw new Error(`unknown file type: ${filename} (${fileType})`);
  }
};

const ModelLoader = {
  loadModelUrl,
};
export default ModelLoader;