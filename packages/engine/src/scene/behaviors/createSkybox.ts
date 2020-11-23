import { Sky } from '@xr3ngine/engine/src/scene/classes/Sky';
import { CanvasTexture, RGBFormat, sRGBEncoding } from 'three';
import { CubeTexture, TextureLoader } from 'three';
import { CubeRefractionMapping } from 'three';
import { EquirectangularReflectionMapping } from 'three';
import { Vector3 } from 'three';
import { addObject3DComponent } from '../../common/behaviors/Object3DBehaviors';
import { isClient } from '../../common/functions/isClient';
import { Engine } from '../../ecs/classes/Engine';
import { addComponent, getComponent, getMutableComponent } from '../../ecs/functions/EntityFunctions';
import { ScaleComponent } from '../../transform/components/ScaleComponent';
import { SkyboxComponent } from '../components/SkyboxComponent';

export default function createSkybox(entity, args: {
  obj3d;
  objArgs: any
}): void {
  if (!isClient){
    return;
  }
  
  console.log(args.objArgs);

  if (args.objArgs.skytype === "skybox") {

    addObject3DComponent(entity, { obj3d: Sky, objArgs: args.objArgs });
    addComponent(entity, ScaleComponent);
    const scaleComponent = getMutableComponent<ScaleComponent>(entity, ScaleComponent);
    scaleComponent.scale = [args.objArgs.distance, args.objArgs.distance, args.objArgs.distance];
    const uniforms = Sky.material.uniforms;
    const sun = new Vector3();
    const theta = Math.PI * (args.objArgs.inclination - 0.5);
    const phi = 2 * Math.PI * (args.objArgs.azimuth - 0.5);

    sun.x = Math.cos(phi);
    sun.y = Math.sin(phi) * Math.sin(theta);
    sun.z = Math.sin(phi) * Math.cos(theta);
    uniforms.mieCoefficient.value = args.objArgs.mieCoefficient;
    uniforms.mieDirectionalG.value = args.objArgs.mieDirectionalG;
    uniforms.rayleigh.value = args.objArgs.rayleigh;
    uniforms.turbidity.value = args.objArgs.turbidity;
    uniforms.sunPosition.value = sun;

  } else if (args.objArgs.skytype === "cubemap") {
    
    const imageObj = new Image();
    

    imageObj.onload = function () {
      
      let canvas, context;
      const tileWidth = imageObj.height;
      const canvases = [];


      for (let i = 0; i < 6; i++) {

        canvas = document.createElement('canvas');
        context = canvas.getContext('2d');
        canvas.height = tileWidth;
        canvas.width = tileWidth;
        context.drawImage(imageObj, tileWidth * i, 0, tileWidth, tileWidth, 0, 0, tileWidth, tileWidth);
        // context.drawImage();
        canvases.push(canvas);

      }
      console.log(canvases);

      const textureCube = new CubeTexture(canvases);
      //  const textureCube = new CanvasTexture(canvases);
      textureCube.mapping = CubeRefractionMapping;
      textureCube.needsUpdate = true;
      // textureCube.format = RGBFormat;

      Engine.scene.background = textureCube;
    };
    
    imageObj.src = args.objArgs.texture;

    console.log(imageObj);
    
    // src= "/packages/server/upload/kazuend-2KXEb_8G5vo-unsplash.jpg"
    
  }
  else if (args.objArgs.skytype === "equirectangular") {
    // Engine.scene.background = new TextureLoader().load(args.objArgs.texture);

    const textureLoader = new TextureLoader();

			textureLoader.load( args.objArgs.texture, ( texture ) => {

				texture.encoding = sRGBEncoding;
				texture.mapping = EquirectangularReflectionMapping;
        
        Engine.scene.background = texture;

			} );
  }
}
