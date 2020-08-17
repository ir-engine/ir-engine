import { Component, ComponentConstructor } from "./Component";
export interface SystemStateComponentConstructor<C extends Component<any>> extends ComponentConstructor<C> {
    isSystemStateComponent: true;
    new (): C;
}
export declare class SystemStateComponent<C> extends Component<C> {
    static isSystemStateComponent: boolean;
}
