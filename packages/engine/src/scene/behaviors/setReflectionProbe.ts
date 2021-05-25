import { PMREMGenerator, sRGBEncoding, TextureLoader } from 'three';
import { isClient } from '../../common/functions/isClient';
import { Behavior } from '../../common/interfaces/Behavior';
import { Engine } from '../../ecs/classes/Engine';
import { EngineEvents } from '../../ecs/classes/EngineEvents';
import { envmapPhysicalParsReplace, worldposReplace } from '../../editor/nodes/helper/BPCEMShader';
import { ReflectionProbeSettings, ReflectionProbeTypes } from '../../editor/nodes/ReflectionProbeNode';

export const setReflectionProbe: Behavior = (entity, args: {}) => {

  if (!isClient) {
    return;
  }

  const renderer = Engine.renderer
  const pmremGenerator = new PMREMGenerator(renderer);
  const options:ReflectionProbeSettings=args["objArgs"]["options"];
  
  switch(options.reflectionType){
    
    case ReflectionProbeTypes.Baked:
      const envMapAddress="/ReflectionProbe/envMap.png";
      EngineEvents.instance.once(EngineEvents.EVENTS.SCENE_LOADED,()=>SceneisLoaded());
      new TextureLoader().load(envMapAddress, (texture) => {
        const EnvMap = pmremGenerator.fromEquirectangular(texture).texture;
        Engine.scene.environment = EnvMap;
        texture.dispose();
        pmremGenerator.dispose();
      });
      break;
    
    case ReflectionProbeTypes.Realtime:
      console.log("Realtime Probe here");
      break;
    
    default:
      console.log("Error in Reflection Probe Type");
      break;
  }


  const SceneisLoaded=()=>{
    //Note:Change this
    if(!options.boxProjection){
      console.log("Reflection Probe:Scene is loaded");
      Engine.scene.traverse(child=>{
        child=child as any;
        if ((child as any).isMesh || (child as any).isSkinnedMesh) {
          (child as any).material.envMapIntensity??=options.intensity;
          (child as any).material.onBeforeCompile = function ( shader ) {

                //these parameters are for the cubeCamera texture
                console.log("BeforeCompiling The Shader")
                const cubeMapPos=this.reflectionProbeSettings.probePositionOffset.clone().add(this.position);
                shader.uniforms.cubeMapSize = { value: options.probeScale};
                shader.uniforms.cubeMapPos = { value: cubeMapPos};
    
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

