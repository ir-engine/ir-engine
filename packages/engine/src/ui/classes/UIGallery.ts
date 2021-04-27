import { createButton } from '../functions/createItem';
import { Block } from "../../assets/three-mesh-ui";
import { Engine } from "../../ecs/classes/Engine";
import {createGallery} from '../components/GalleryPanel';
import {createBuyPanel} from '../components/BuyPanel';
import {createPlayPanel} from '../components/PlayPanel';
import {VideoPlayer} from '../../video/classes/VideoPlayer';
import {Control} from '../../video/classes/Control';

export class UIGallery extends UIBaseElement {
  

  constructor() {
    super();

    this.init();
  }

  init() {
    // console.log(Engine.scene, Engine.entityMap, Engine.componentsMap);
    // Engine.scene.add;
    
    
  }
}