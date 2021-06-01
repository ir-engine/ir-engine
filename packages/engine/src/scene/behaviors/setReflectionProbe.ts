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
        const envMapAddress=`/ReflectionProbe/${options.lookupName}.png`;
        new TextureLoader().load(envMapAddress, (texture) => {
          Engine.scene.environment=CubemapCapturer.convertToCubemap(Engine.renderer,texture,options.resolution).texture;
          texture.dispose();
        });

        break;
      case ReflectionProbeTypes.Realtime:
        const map=new CubemapCapturer(Engine.renderer,Engine.scene,options.resolution,false);
        const EnvMap =  map.update(options.probePosition).texture;
        Engine.scene.environment = EnvMap;
        break;
    }


      Engine.entities.forEach(entity=>{
        if(entity.components){
            Object.values(entity.components).forEach((element)=>{
              if((element as any).value){
                const mat=(element as any).value.material;
                if(mat){
                  mat.envMapIntensity=options.intensity;
                  mat.onBeforeCompile = function ( shader ) {
                      shader.uniforms.cubeMapSize = { value: {x:10,y:10,z:10}};//options.probeScale};
                      shader.uniforms.cubeMapPos = { value: options.probePositionOffset};
                      shader.vertexShader = 'varying vec3 vWorldPosition;\n' + shader.vertexShader;
                      shader.vertexShader = shader.vertexShader.replace(
                          '#include <worldpos_vertex>',
                          worldposReplace
                      );
                      shader.fragmentShader = shader.fragmentShader.replace(
                          '#include <envmap_physical_pars_fragment>',
                          envmapPhysicalParsReplace
                      );
                }
                  console.log("Material is found");
              }
          }
      });
    }
      });
  }
}
  