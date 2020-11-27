import { Behavior } from '../../common/interfaces/Behavior';
import DracosisPlayer from '@xr3ngine/volumetric/src/Player'
import { Engine } from '../../ecs/classes/Engine';
import VolumetricComponent from "../components/VolumetricComponent"
import { addComponent, getMutableComponent } from '../../ecs/functions/EntityFunctions';
export const createVolumetric: Behavior = (entity, args: any) => {
    console.warn("TODO: handle volumetric, args are", args);
    // Create new volumetric player component
   addComponent(entity, VolumetricComponent);
   const volumetricComponent = getMutableComponent(entity, VolumetricComponent);
    const DracosisSequence = new DracosisPlayer({
        scene: Engine.scene,
        renderer: Engine.renderer,
        meshFilePath: args.src,
        videoFilePath: args.src.replace('.drcs', '.mp4'),
        loop: args.loop,
        autoplay: args.autoPlay,
        startFrame: 0,
        endFrame: -1,
        scale: 0.001,
        bufferSize: 80,
      });
    
      volumetricComponent.player = DracosisSequence;

};