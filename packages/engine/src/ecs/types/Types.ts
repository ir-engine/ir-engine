import { ComponentSchema } from "../interfaces/ComponentInterfaces";

/** Copy function definition */
export type TypeCopyFunction<T> = (src: T, dest: T) => T
/** Clone function definition */
export type TypeCloneFunction<T> = (value: T) => T

/** Base Interface for prop type */
export interface PropTypeDefinition<T, D> {
  /** Name of the prop. */
  name: string;
  /** Default value. */
  default?: D;
  /** Copy Function */
  copy: TypeCopyFunction<T>;
  /** Clone Function */
  clone: TypeCloneFunction<T>;
}

export interface PropType<T, D> extends PropTypeDefinition<T, D> {
  /** Mark the prop as type. */
  isType: true;
}

export type NumberPropType = PropType<number, number>
export type BooleanPropType = PropType<boolean, boolean>
export type StringPropType = PropType<string, string>
export type ArrayPropType<T> = PropType<T[], []>
export type RefPropType<T> = PropType<T, undefined>
export type JSONPropType = PropType<any, null>

export const copyValue = <T>(src: T, dest: T): T => { dest = src; return src; };

export const cloneValue = <T>(value: T): T => value;

export const copyArray = <T>(src?: T[], dest?: T[]): T[] => {
  dest = [...src];
  return dest;
};
export const cloneArray = <T>(value: T[]): T[] => value && value.slice();

export const copyJSON = (src: any, dest: any): any => JSON.parse(JSON.stringify(src));

export const cloneJSON = (value: any): any => JSON.parse(JSON.stringify(value));

export const copyCopyable = <T>(src: T, dest: T): T => {
  if (!src) {
    return src;
  }

  if (!dest) {
    return (src as any).clone();
  }

  return (dest as any).copy(src);
};

export const cloneClonable = <T>(value: T): T => value && (value as any).clone();

/** Create a Type
 * 
 * @param typeDefinition Definition of the type which will be used to create the type
 * @returns Props Type created with given type definition.
 */
export function createType<T, D> (typeDefinition: PropTypeDefinition<T, D>): PropType<T, D> {
  const mandatoryProperties = ['name', 'copy', 'clone'];

  const undefinedProperties = mandatoryProperties.filter(p => {
    return !typeDefinition[p];
  });

  if (undefinedProperties.length > 0) {
    throw new Error(
      `createType expects a type definition with the following properties: ${undefinedProperties.join(', ')}`
    );
  }

  (typeDefinition as any).isType = true;

  return typeDefinition as PropType<T, D>;
}

/**
 * Standard types.
 * **NOTE:** Use ref for attaching objects to this entity unless you want to make the object clonable.
 */
export const Types = {
  Number: createType({
    name: 'Number',
    default: 0,
    copy: copyValue,
    clone: cloneValue
  }),

  Boolean: createType({
    name: 'Boolean',
    default: false,
    copy: copyValue,
    clone: cloneValue
  }),

  String: createType({
    name: 'String',
    default: '',
    copy: copyValue,
    clone: cloneValue
  }),

  Array: createType({
    name: 'Array',
    default: [],
    copy: copyArray,
    clone: cloneArray
  }),

  Ref: createType({
    name: 'Ref',
    default: undefined,
    copy: copyValue,
    clone: cloneValue
  }),

  JSON: createType({
    name: 'JSON',
    default: null,
    copy: copyJSON,
    clone: cloneJSON
  }),

  Vector3Type: createType({
    name: 'Vector3',
    default: [0, 0, 0],
    copy: copyCopyable,
    clone: cloneClonable
  }),

  Vector2Type: createType({
    name: 'Vector2',
    default: [0, 0],
    copy: copyCopyable,
    clone: cloneClonable
  }),

  QuaternionType: createType({
    name: 'Quaternion',
    default: [0, 0, 0],
    copy: copyCopyable,
    clone: cloneClonable
  })
};

export const fromEntries = (Object as any).fromEntries || ( iterable =>
  [...iterable].reduce((obj, [key, val]) => {
    obj[key] = val;
    return obj;
  }, {})
);

const capitalize = (s: string) => s[0].toUpperCase() + s.slice(1);

export function types(
  defaults: object = {value: {type: Types.Ref}}
): ComponentSchema {
  return fromEntries(
      Object.entries(defaults).map( (name, value) => 
          [name, {type: Types[capitalize(typeof value)] || Types.Ref, default: value}]
      )
  );
}