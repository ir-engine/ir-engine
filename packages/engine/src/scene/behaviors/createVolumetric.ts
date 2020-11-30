import { Behavior } from '../../common/interfaces/Behavior';
export const createVolumetric: Behavior = (entity, args: any) => {
    console.warn("TODO: handle volumetric, args are", args);
  //   // Create new volumetric player component
  //  addComponent(entity, VolumetricComponent);
  //  const volumetricComponent = getMutableComponent(entity, VolumetricComponent);
  //   // Create new sequence with arg values

  //   // If autoplay, autoplay

  //   const DracosisSequence = new DracosisPlayer({
  //       scene: Engine.scene,
  //       renderer: Engine.renderer,
  //       // filePath: 'https://s3-us-west-1.amazonaws.com/wildcapture.io/files/hula_med_590_1k.drcs',
  //       filePath: args.src,
  //       onLoaded: () => console.log("Loaded volumetric"),
  //       playOnStart: true,
  //       loop: true,
  //       startFrame: 0,
  //       endFrame: -1,
  //       scale: 0.001,
  //       frameRate: 10,
  //       speedMultiplier: 1,
  //       bufferSize: 80,
  //       serverUrl: 'http://localhost:8000',
  //       audioUrl:"https://cssing.org.ua/captainmorgan_audio09.mp3"
  //     });
    
  //     volumetricComponent.player = DracosisSequence;
  //     DracosisSequence.play();

};
