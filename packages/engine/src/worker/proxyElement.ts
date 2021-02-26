// refference: https://threejsfundamentals.org/threejs/lessons/threejs-offscreencanvas.html
import { EventDispatcher } from 'three';

/**
 * offscrennCanvas dammyElement for orbitControls
 */
export default class ProxyElement extends EventDispatcher {
  /**
   * main page context
   * */
  private width: number;
  private height: number;
  private left: number;
  private top: number;
  constructor({
    width,
    height,
    left,
    top,
  }: {
    width: number;
    height: number;
    left: number;
    top: number;
  }) {
    super();
    this.width = width;
    this.height = height;
    this.left = left;
    this.top = top;
    this.focus = this.focus.bind(this);
    this.getBoundingClientRect = this.getBoundingClientRect.bind(this);
  }

  public focus() {}
  public get ownerDocument() {
    return this;
  }

  public get clientWidth() {
    return this.width;
  }
  public get clientHeight() {
    return this.height;
  }
  public get innerWidth() {
    return this.width;
  }
  public get innerHeight() {
    return this.height;
  }
  public getBoundingClientRect() {
    return {
      left: this.left,
      top: this.top,
      width: this.width,
      height: this.height,
      right: this.left + this.width,
      bottom: this.top + this.height,
    };
  }
}
