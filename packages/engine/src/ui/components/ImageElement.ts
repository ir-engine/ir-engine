import { Block } from "../../assets/three-mesh-ui";
import { Object3D, TextureLoader } from "three";

class ImageElement extends Object3D {
    container: Block;

    constructor(width, height, x, y, url) {
      super();  
      this.init(width, height, x, y, url);
    }
  
    init(width, height, x, y, url) {
      this.container = new Block({
        width: width,
        height: height,
        backgroundSize: 'cover'
      });//contain, cover, stretch
  
      this.renderOrder = 1;
      this.container.renderOrder = 1;
  
      this.container.position.set(x, y, 0);
      this.add(this.container);
  
      const loader = new TextureLoader();
      loader.load(
            url,
            
            // onLoad callback
            (texture) => {
                this.container.set({backgroundTexture: texture});
            },

            // onProgress callback currently not supported
            undefined,

            // onError callback
            ( err ) => {
                console.error( 'An error happened.' );
            }
        );
    }

    resize(size){
        this.container.set(size);
        // this.container.needsUpdate = true;
        // console.log('panel picked enlarge', size);
    }
}

export default ImageElement;
