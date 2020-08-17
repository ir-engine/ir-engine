export declare type TypeCopyFunction<T> = (src: T, dest: T) => T;
export declare type TypeCloneFunction<T> = (value: T) => T;
export interface PropTypeDefinition<T, D> {
    name: string;
    default?: D;
    copy: TypeCopyFunction<T>;
    clone: TypeCloneFunction<T>;
}
export interface PropType<T, D> extends PropTypeDefinition<T, D> {
    isType: true;
}
export declare type NumberPropType = PropType<number, number>;
export declare type BooleanPropType = PropType<boolean, boolean>;
export declare type StringPropType = PropType<string, string>;
export declare type ArrayPropType<T> = PropType<Array<T>, []>;
export declare type RefPropType<T> = PropType<T, undefined>;
export declare type JSONPropType = PropType<any, null>;
export declare const copyValue: <T>(src: T, dest: T) => T;
export declare const cloneValue: <T>(value: T) => T;
export declare const copyArray: <T>(src?: T[], dest?: T[]) => T[];
export declare const cloneArray: <T>(value: T[]) => T[];
export declare const copyJSON: (src: any, dest: any) => any;
export declare const cloneJSON: (value: any) => any;
export declare const copyCopyable: <T>(src: T, dest: T) => T;
export declare const cloneClonable: <T>(value: T) => T;
export declare function createType<T, D>(typeDefinition: PropTypeDefinition<T, D>): PropType<T, D>;
/**
 * Standard types
 */
export declare const Types: {
    Number: PropType<unknown, number>;
    Boolean: PropType<unknown, boolean>;
    String: PropType<unknown, string>;
    Array: PropType<unknown, any[]>;
    Ref: PropType<unknown, any>;
    JSON: PropType<any, any>;
    Vector3Type: PropType<unknown, number[]>;
    Vector2Type: PropType<unknown, number[]>;
    QuaternionType: PropType<unknown, number[]>;
};
