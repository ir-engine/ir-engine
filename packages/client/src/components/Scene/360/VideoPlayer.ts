// @ts-ignore
import { Player } from 'shaka-player';    // TODO: resolve this
import { TextureLoader, VideoTexture, Mesh, SphereGeometry, MeshBasicMaterial, BackSide, Texture } from "three";
import { Control } from '@xrengine/engine/src/ui/classes/Control';

enum PLAYER_STATE {
  INIT,
  PLAYING,
  PAUSED,
}
export class VideoPlayer {
  player: Player;
  video: HTMLVideoElement;
  skyDomeMaterial: MeshBasicMaterial;
  skyDome: Mesh;
  skyDomeTexture: Texture;
  control: Control;
  
  state: PLAYER_STATE;

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
            this.skyDomeTexture = texture;
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

    this.state = PLAYER_STATE.INIT;
    // navigator.mediaSession.setActionHandler('stop', this.stopVideo);

    this.video.ondurationchange = () => {
      this.control.updateDuration(this.video.duration);
    };

    this.video.ontimeupdate = () => {
      this.control.updatePos(this.video.currentTime);
    };
  }

  playVideo(url, played, paused){
    switch(this.state){
      case PLAYER_STATE.INIT:
        this.play(url);
        this.state = PLAYER_STATE.PLAYING;
        played();
        break;
      case PLAYER_STATE.PLAYING:
        this.video.pause();        
        this.state = PLAYER_STATE.PAUSED;
        paused();
        break;
      case PLAYER_STATE.PAUSED:
        this.video.play();
        this.state = PLAYER_STATE.PLAYING;
        played();
        break;
    }
  }

  play(url){
    const promise = this.player.load(url);
      if (promise !== undefined) {
        promise.then(_ => {
          
          // document.addEventListener("click", ()=>{
            const p = this.video.play();
  
            const texture = new VideoTexture(this.video);
            this.skyDomeMaterial.map = texture;
            this.skyDomeMaterial.needsUpdate = true;
            
            if (p !== undefined) {
              p.then(_ => {
  
              }).catch(error => {
              });
            }
  
          // });
          
          }).catch(error => {
        });
      }
  }

  stopVideo(){
    this.video.pause();
    this.skyDomeMaterial.map = this.skyDomeTexture;
    this.skyDomeMaterial.needsUpdate = true;
    this.state = PLAYER_STATE.INIT;
  }

  seek(time) {
    this.video.currentTime = time;
  }
}