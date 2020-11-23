import DracosisPlayer from '@xr3ngine/volumetric/src/Player';
import { Engine } from '@xr3ngine/engine/src/ecs/classes/Engine'

export function LoadPlayer() {

  const DracosisSequence = new DracosisPlayer({
    scene: Engine.scene,
    renderer: Engine.renderer,
    // filePath: 'https://s3-us-west-1.amazonaws.com/wildcapture.io/files/hula_med_590_1k.drcs',
    filePath: 'http://localhost:8000/dracosis',
    onLoaded: () => console.log("Loaded"),
    playOnStart: true,
    loop: true,
    startFrame: 0,
    endFrame: -1,
    scale: 0.001,
    frameRate: 10,
    speedMultiplier: 1,
    bufferSize: 80,
    serverUrl: 'http://localhost:8000',
    audioUrl:"https://cssing.org.ua/captainmorgan_audio09.mp3"
  });

  DracosisSequence.play();

}
