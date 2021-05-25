import { PMREMGenerator, sRGBEncoding, TextureLoader } from 'three';
import { isClient } from '../../common/functions/isClient';
import { Behavior } from '../../common/interfaces/Behavior';
import { Engine } from '../../ecs/classes/Engine';
import { EngineEvents } from '../../ecs/classes/EngineEvents';
import { envmapPhysicalParsReplace, worldposReplace } from '../../editor/nodes/helper/BPCEMShader';
import CubemapCapturer from '../../editor/nodes/helper/CubemapCapturer';
import { ReflectionProbeSettings, ReflectionProbeTypes } from '../../editor/nodes/ReflectionProbeNode';

export const setReflectionProbe: Behavior = (entity, args: {}) => {

  if (!isClient) {
    return;
  }

  const options:ReflectionProbeSettings=args["options"];
  EngineEvents.instance.once(EngineEvents.EVENTS.SCENE_LOADED,()=>SceneIsLoaded());

  const SceneIsLoaded=()=>{
    
    switch(options.reflectionType){
      case ReflectionProbeTypes.Baked:
        const envMapAddress="/ReflectionProbe/envMap.png";
        new TextureLoader().load(envMapAddress, (texture) => {
          const pmremGenerator = new PMREMGenerator(Engine.renderer);
          const EnvMap = pmremGenerator.fromEquirectangular(texture).texture;
          Engine.scene.environment = EnvMap;
          texture.dispose();
          pmremGenerator.dispose();
        });
        break;
      case ReflectionProbeTypes.Realtime:
        const map=new CubemapCapturer(Engine.renderer,Engine.scene,options.resolution,false);
        const EnvMap =  map.update(options.probePosition).texture;
        Engine.scene.environment = EnvMap;
        break;
    }
    
    if(options.boxProjection){
      Engine.scene.traverse(child=>{
      child=child as any;
      if ((child as any).isMesh || (child as any).isSkinnedMesh) {
        (child as any).material.envMapIntensity??=options.intensity;
        (child as any).material.onBeforeCompile = function ( shader ) {
              //these parameters are for the cubeCamera texture
              shader.uniforms.cubeMapSize = { value: options.probeScale};
              shader.uniforms.cubeMapPos = { value: options.probePosition};
              //replace shader chunks with box projection chunks
              shader.vertexShader = 'varying vec3 vWorldPosition;\n' + shader.vertexShader;
              shader.vertexShader = shader.vertexShader.replace(
                  '#include <worldpos_vertex>',
                  worldposReplace
              );
              shader.fragmentShader = shader.fragmentShader.replace(
                  '#include <envmap_physical_pars_fragment>',
                  envmapPhysicalParsReplace
              );
        };
        }
      });
    }
  }
};

