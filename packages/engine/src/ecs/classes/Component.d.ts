import { PropType } from "../types/Types";
export declare type ComponentSchemaProp = {
    default?: any;
    type: PropType<any, any>;
};
export declare type ComponentSchema = {
    [propName: string]: ComponentSchemaProp;
};
export interface ComponentConstructor<C extends Component<any>> {
    schema: ComponentSchema;
    isComponent: true;
    _typeId: any;
    new (props?: Partial<Omit<C, keyof Component<any>>> | false): C;
}
export declare class Component<C> {
    isComponent: boolean;
    static schema: ComponentSchema;
    static isComponent: true;
    static _typeId: number;
    _pool: any;
    _typeId: any;
    assetsLoaded: boolean;
    name: any;
    constructor(props?: Partial<Omit<C, keyof Component<any>>> | false);
    copy(source: any): this;
    clone(): any;
    reset(): void;
    dispose(): void;
    static getName(): any;
    checkUndefinedAttributes(src: any): void;
}
