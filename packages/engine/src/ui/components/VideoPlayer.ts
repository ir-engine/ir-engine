import shaka from 'shaka-player';
import { Object3D, Color, TextureLoader, VideoTexture, Mesh, SphereGeometry, MeshBasicMaterial, BackSide } from "three";

export class VideoPlayer {
  player: shaka.Player;
  video: HTMLVideoElement;
  skyDomeMaterial: MeshBasicMaterial;
  skyDome: Mesh;

  constructor(root, envUrl){
    this.skyDomeMaterial = new MeshBasicMaterial( { 
      map: null
    } );
    this.skyDomeMaterial.side = BackSide;

    this.skyDome = new Mesh( 
      new SphereGeometry( 10, 60, 40 ), 
      this.skyDomeMaterial);

      this.skyDome.scale.x = -1;
      this.skyDome.rotation.y = Math.PI*1.5;

    root.add(this.skyDome);

    const loader = new TextureLoader();
    loader.load(
          envUrl,
          
          // onLoad callback
          (texture) => {
            this.skyDomeMaterial.map = texture;
          },

          // onProgress callback currently not supported
          undefined,

          // onError callback
          ( err ) => {
              console.error( 'An error happened.' );
          }
    );

    this.initPlayer();
  }

  initPlayer(){
    this.video = document.createElement( 'video' );
    document.documentElement.append( this.video );
    // video.setAttribute('crossorigin', 'anonymous');
    this.video.style.display = 'none';
    // video.loop = "loop";
    // video.src = url;
    // video.muted = true;
    // video.volume = 0.5;
    // video.controls = true;
    // video.autoplay = true;
    
    shaka.polyfill.installAll();
    this.player = new shaka.Player(this.video);
  }

  playVideo(url){
    const promise = this.player.load(url);
    if (promise !== undefined) {
      promise.then(_ => {
        
        document.addEventListener("click", ()=>{
          const p = this.video.play();
          console.log('playing');

          const texture = new VideoTexture(this.video);
          console.log('texture', this.skyDomeMaterial, texture);
          this.skyDomeMaterial.map = texture;
          this.skyDomeMaterial.needsUpdate = true;
          // this.skyDome.needsUpdate = true;
          
          if (p !== undefined) {
            p.then(_ => {

            }).catch(error => {
            });
          }

        });
        
        }).catch(error => {
      });
    }
  }
}