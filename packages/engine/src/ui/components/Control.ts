import { Color, Object3D, CircleGeometry, MeshPhongMaterial, Mesh, Texture, TextureLoader } from "three";
import { Block } from '../../assets/three-mesh-ui';
import { createButton, createItem, createRow, createCol } from '../functions/createItem';
import { UIBaseElement, UI_ELEMENT_SELECT_STATE } from "../classes/UIBaseElement";
import { Movable } from './Movable';
export class Control extends Object3D{
  seeker: Mesh;
  durationWidth: number;
  duration: number;
  playIcon: Texture;
  pauseIcon: Texture;

  constructor(callbacks){
    super();

    callbacks.move = (pos, state) => {
      this.seeker.position.set(pos.x, 0.15, 0.025);
      const time = (pos.x + this.durationWidth/2.0 ) / this.durationWidth * this.duration;
      callbacks.seek(time);
    }

    const loader = new TextureLoader();
    loader.load( "360/playbtn.png",
          // onLoad callback
          (texture) => {
            this.playIcon = texture;
          },

          // onProgress callback currently not supported
          undefined,

          // onError callback
          ( err ) => {
              console.error( 'An error happened.' );
          }
    );
    loader.load( "360/pausebtn.png",
        // onLoad callback
        (texture) => {
          this.pauseIcon = texture;
        },

        // onProgress callback currently not supported
        undefined,

        // onError callback
        ( err ) => {
            console.error( 'An error happened.' );
        }
    );

    let bar = this.createSeekbar(callbacks);
    this.add(bar);

    // let seeker = new Block({
    //   width: 0.1, 
    //   height: 0.1, 
    //   backgroundOpacity: 0.7,
    //   backgroundColor: new Color('white'),
    //   borderRadius: 0.05,
    //   // offset: -1
    // });
    // seeker.position.set(0, 0.15, 0.025);

    const geometry = new CircleGeometry( 0.05, 32 );
    const material = new MeshPhongMaterial( { color: 0xeeeeee, transparent: true, opacity: 1 } );

    this.seeker = new Mesh( geometry, material );
    this.seeker.position.set(this.durationWidth/2.0, 0.15, 0.025);

    this.add(this.seeker);
  }

  updateDuration(duration){
    this.duration = duration;
    console.log("UpdateDuration", duration);
  }

  updatePos(time){
    if( this.duration < 0 )
      return;

    const pos = this.durationWidth * time/this.duration - this.durationWidth/2.0;
    this.seeker.position.set(pos, 0.15, 0.025);
  }

  createSeekbar(callbacks) {
    const backButton = createButton({
      title: "Library"
    });

    const playButton = createItem({
      title: null,
      description: null,
      imageUrl: "360/playbtn.png",
      width: 0.2,
      height: 0.2,
      selectable: true
    });

    const width = 0.4*2+0.2+0.4*2;
    const bar = createRow(width, 0.2, [
      backButton, 
      new Block({width: 0.4, height: 0.1, backgroundOpacity: 0.0, }), 
      playButton, 
      new Block({width: 0.8, height: 0.1, backgroundOpacity: 0.0, })
    ], 0);

    bar.set({
      alignContent: 'bottom',
    });

    this.durationWidth = width*0.8;

    const progressBar = new Block({
      width: this.durationWidth,
      height: 0.02,
      backgroundColor: new Color('yellow'),
      backgroundOpacity: 1.0,
      margin: 0.1,
    });

    const control = createCol(width, 0.6, [progressBar, bar], 0.05);
    control.set({
      backgroundOpacity: 1.0,
      borderRadius: 0.05
    })

    progressBar.set({
      borderRadius: 0.015
    })
    bar.set({
      borderRadius: 0.015
    })

    progressBar.setMoveHandler = (pos, state) => {
      const lpos = progressBar.worldToLocal(pos); 
      console.log(pos, lpos);
      callbacks.move(lpos, state);
    };

    playButton.addEventListener(UI_ELEMENT_SELECT_STATE.SELECTED, () => {
      callbacks.play(
        ()=>{//played 
          playButton.set({backgroundTexture: this.pauseIcon});
        },
        ()=>{//paused
          playButton.set({backgroundTexture: this.playIcon});
        }
      );      
    })
    
    backButton.addEventListener(UI_ELEMENT_SELECT_STATE.SELECTED, () => {
      callbacks.back();
    })

    return control;
  }
} 

