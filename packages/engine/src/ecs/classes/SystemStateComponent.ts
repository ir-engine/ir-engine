import { Component } from './Component';
import { ComponentConstructor } from '../interfaces/ComponentInterfaces';

export interface SystemStateComponentConstructor<C extends Component<any>> extends ComponentConstructor<C> {
  isSystemStateComponent: true;
  new (): C;
}

export class SystemStateComponent<C> extends Component<C> {
  static isSystemStateComponent = true
}
