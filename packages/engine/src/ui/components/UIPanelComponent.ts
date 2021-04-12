import { Component } from '../../ecs/classes/Component';
import { Types } from '../../ecs/types/Types';
import SceneGallery from "../components/SceneGallery";

export class UIPanelComponent extends Component<UIPanelComponent> {

  panel: any;
  
  static _schema = {
    panel: { type: Types.Ref, default: null },
  }

  constructor(){
    super();
    this.init();
  }

  init(){
    this.panel = new SceneGallery();    
  }
}
