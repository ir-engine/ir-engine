import { Object3D, Color, TextureLoader, VideoTexture, Mesh, SphereGeometry, MeshBasicMaterial, BackSide } from "three";

export const createDome = (envUrl) => {
    let skyDomeMaterial = new MeshBasicMaterial( { 
      map: null
    } );
    skyDomeMaterial.side = BackSide;

    let skyDome = new Mesh( 
      new SphereGeometry( 10, 60, 40 ), 
    skyDomeMaterial);

    skyDome.scale.x = -1;
    skyDome.rotation.y = Math.PI*1.5;

    const loader = new TextureLoader();
    loader.load(
          envUrl,
          
          // onLoad callback
          (texture) => {
            skyDomeMaterial.map = texture;
          },

          // onProgress callback currently not supported
          undefined,

          // onError callback
          ( err ) => {
              console.error( 'An error happened.' );
          }
    );

    return {
        skyDome: skyDome,
        skyDomeMaterial: skyDomeMaterial
    };
  }

  
  export const createPlayer = (skyDomeMaterial) => {
    const url = "360/ITN_Wrecks_FOR_REVIEW_4kx2k_360_h264_40Mbps.mp4";
    let video = document.createElement( 'video' );
    document.documentElement.append( video );
    // video.setAttribute('crossorigin', 'anonymous');
    video.style.display = 'none';
    // video.loop = "loop";
    // video.src = url;
    // video.muted = true;
    // video.volume = 0.5;
    // video.controls = true;
    // video.autoplay = true;
    const texture = new VideoTexture(video);
    skyDomeMaterial.map = texture;

    document.addEventListener("click", function(){
      var promise = video.play();
      console.log('playing');
      if (promise !== undefined) {
        promise.then(_ => {
        }).catch(error => {
        });
      }
    });

    const initShaka = (video, url) => {
        shaka.polyfill.installAll();
        const player = new shaka.Player(video);
        var promise = player.load(url);
        if (promise !== undefined) {
          promise.then(_ => {
            }).catch(error => {
          });
        }
      }

    initShaka(video, url);      
  }
