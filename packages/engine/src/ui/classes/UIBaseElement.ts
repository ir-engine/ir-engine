import { Object3D } from "three";

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