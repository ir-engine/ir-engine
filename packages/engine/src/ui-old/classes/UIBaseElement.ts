import { Object3D } from "three";
import { Block, Text } from "../../assets/three-mesh-ui";

export class UIBlock extends Block {

}

export class UIText extends Text {
  
}

export enum UI_ELEMENT_SELECT_STATE {
  IDLE = 'idle',
  HOVERED = 'hovered',
  SELECTED = 'selected',
}

export class UIBaseElement extends Object3D {
  add: any; // overwrite three
  elements: UIBaseElement[] = [];
  isUIElement = true;

  constructor() {
    super();
  }

  setSelectState(state: UI_ELEMENT_SELECT_STATE) { }
}