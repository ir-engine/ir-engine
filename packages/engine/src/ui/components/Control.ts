import { Color, Object3D, CircleGeometry, MeshPhongMaterial, Mesh } from "three";
import { Block } from '../../assets/three-mesh-ui';
import { createButton, createItem, createRow, createCol } from '../functions/createItem';

export class Control extends Object3D{
  constructor(){
    super();

    let bar = this.createSeekbar();
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
    const seeker = new Mesh( geometry, material );
    seeker.position.set(0, 0.15, 0.025);

    this.add(seeker);
  }

  createSeekbar() {
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

    const progressBar = new Block({
      width: width*0.8,
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

    return control;
  }
} 

