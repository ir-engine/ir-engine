export interface TagComponentConstructor<C extends Component<{}>> extends ComponentConstructor<C> {
  isTagComponent: true
  new (): C
}

import { Component, ComponentConstructor } from "./Component"

export class TagComponent extends Component<any> {
  static isTagComponent = true
  constructor() {
    super(false)
  }
}
