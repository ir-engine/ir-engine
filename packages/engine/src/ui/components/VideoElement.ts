import { Block, Text } from "../../assets/three-mesh-ui";
import { Object3D, Color, VideoTexture, TextureLoader, Texture, ClampToEdgeWrapping, RepeatWrapping, LinearFilter, RGBFormat, RGBAFormat } from "three";
import {MeshBasicMaterial, FrontSide, PlaneGeometry, Mesh} from 'three';
import shaka from 'shaka-player';

class VideoElement extends Object3D {
    container: Block;

    constructor(width, height, x, y, url) {
      super();  
      this.init(width, height, x, y, url);
    }
  
    init(width, height, x, y, url) {
      this.container = new Block({
        width: width,
        height: height,
        backgroundSize: 'stretch'
      });//contain, cover
  
      this.container.position.set(x, y, 0);
      this.add(this.container);
  
      const tag = document.getElementById('video360');
  
      let video = document.createElement( 'video' );
      // video.setAttribute('crossorigin', 'anonymous');
      // video.style.display = 'none';
      document.documentElement.append( video );
      // video.loop = "loop";
      // video.src = url;
      // video.muted = true;
      // video.volume = 0.5;
      video.controls = true;
      video.autoplay = true;
      const texture = new VideoTexture(video);
      this.container.set({backgroundTexture: texture});
  
      video.addEventListener( 'canplaythrough', function () {
        var promise = video.play();
        console.log('playing');
        if (promise !== undefined) {
          promise.then(_ => {
          }).catch(error => {
          });
        }
      } );
  
      // video.addEventListener( 'play', function () {
      //       //   video.pause();
      //   });

      this.initShaka(video, url);
    }

    resize(width, height){
        this.container.set({ width: width, height: height });
    }

    initShaka(video, url){
      shaka.polyfill.installAll();
      const player = new shaka.Player(video);
      window.player = player;      
      var promise = player.load(url);
      if (promise !== undefined) {
        promise.then(_ => {
          }).catch(error => {
        });
      }
    }
}

export default VideoElement;
