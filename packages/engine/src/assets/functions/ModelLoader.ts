import { LoadingManager } from 'three';
import * as GLTFExporter from 'three-gltf-exporter';
import { GLTFLoader } from "../loaders/gltf/GLTFLoader";
import { SkeletonUtils } from 'three/examples/jsm/utils/SkeletonUtils';
import FBXLoader from '../loaders/fbx/FBXLoader';

import { VRM } from '@pixiv/three-vrm';

const getFileType = filename => {
  if (/\.(?:gltf|glb)$/.test(filename)) {
    return 'gltf';
  } else if (/\.fbx$/.test(filename)) {
    return 'fbx';
  } else if (/\.vrm$/.test(filename)) 
  {
    return 'vrm';
  }
  else {
    return null;
  }
};

const patchModel = model => {
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

  const saved = SkeletonUtils.clone(model.scene);
  model.export = () =>
    new Promise((accept, reject) => {
      new GLTFExporter().parse(
        saved,
        ab => {
          accept(ab);
        },
        {
          binary: true
        }
      );
    });
};
const managerFactory = () => {
  const manager = new LoadingManager();
  const managerLoadPromise = managerFactoryLoadPromise(manager);
  return {
    manager,
    managerLoadPromise
  };
};

const managerFactoryLoadPromise = manager => {
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

export const ModelLoader = async (href, filename = href) => {
  const fileType = getFileType(filename);
  if (fileType === 'gltf') {
    const { manager, managerLoadPromise } = managerFactory();
    const model = await new Promise((accept, reject) => {
      new GLTFLoader(manager).load(
        href,
        accept,
        xhr => {
          //
        },
        reject
      );
    });
    await managerLoadPromise;
    patchModel(model);
    return model;
  } else if (fileType === 'fbx') {
    const { manager, managerLoadPromise } = managerFactory();
    const model = await new Promise((accept, reject) => {
      new FBXLoader().load(
        href,
        scene => {
          accept({ scene });
        },
        xhr => {
          //
        },
        reject
      );
    });
    await managerLoadPromise;
    patchModel(model);
    return model;
  }
  else if (fileType === 'vrm')
  {
    const { manager, managerLoadPromise } = managerFactory();
    const model = await new Promise((accept, reject) => {
      new GLTFLoader(manager).load(
        href,
        scene => {

          // generate a VRM instance from gltf
          VRM.from( scene ).then( ( vrm ) => {
      
            // deal with vrm features
            console.log( "vrm = " + vrm );
            
            // return vrm scene
            accept( vrm );
      
      
          } );
      
        },
	      xhr => {
          //
        },
        reject
      );
    });
    await managerLoadPromise;
    patchModel(model);
    return model;
  }
  else {
    throw new Error(`unknown file type: ${filename} (${fileType})`);
  }
};
