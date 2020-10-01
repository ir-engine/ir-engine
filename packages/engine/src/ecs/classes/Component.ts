import { ComponentSchema, ComponentConstructor } from '../interfaces/ComponentInterfaces';

/**
 * Components are added to entities to define behavior
 * Component functions can be found in {@link @xrengine/engine/ecs/functions/ComponentFunctions}
 */

export class Component<C> {
  /**
   * Defines the attributes and attribute types on the constructed component class
   * All component variables should be reflected in the component schema
   */
  static schema: ComponentSchema

  /**
   * The unique ID for this type of component (<C>)
   */
  static _typeId: number

  /**
   * The pool an individual instantiated component is attached to
   * Each component type has a pool, pool size is set on engine initialization
   */
  _pool: any

  /**
   * The type ID of this component, should be the same as the component's constructed class
   */
  _typeId: any = -1

  /**
   * The name of the component instance, derived from the class name
   */
  name: any = ""

    /**
    * The "entity" this component is attached to
   */
  entity: any = ""

  /**
   * Component class constructor
   */
  constructor (props?: Partial<Omit<C, keyof Component<any>>> | false) {
    this.name = this.constructor.name;
    if (props !== false) {
      const schema = (this.constructor as ComponentConstructor<Component<C>>).schema;

      for (const key in schema) {
        if (props && (props as any).key != undefined) {
          this[key] = props[key];
        } else {
          const schemaProp = schema[key];
          if (schemaProp.default !== undefined) {
            this[key] = schemaProp.type.clone(schemaProp.default);
          } else {
            const type = schemaProp.type;
            this[key] = type.clone(type.default);
          }
        }
      }

      if (process.env.NODE_ENV !== 'production' && props !== undefined) {
        this.checkUndefinedAttributes(props);
      }
    }

    this._pool = null;
  }

  /**
   * Default logic for copying component
   * Each component class can override this
   * @returns this new component as a copy of the source
   */
  copy (source) {
    const schema = (this.constructor as ComponentConstructor<Component<C>>).schema;

    for (const key in schema) {
      if (source[key] !== undefined) { this[key] = schema[key].type.copy(source[key], this[key]); }
    }

    // @DEBUG
    if (process.env.NODE_ENV !== 'production') {
      this.checkUndefinedAttributes(source);
    }

    return this;
  }

  /**
   * Default logic for cloning component
   * Each component class can override this
   * @returns a new component as a clone of itself
   */
  clone () {
    return (this.constructor as any).prototype.copy(this);
  }

  /**
   * Default logic for resetting attributes to default schema values
   * Each component class can override this
   */
  reset () {
    const schema = (this.constructor as ComponentConstructor<Component<C>>).schema;

    for (const key in schema) {
      const schemaProp = schema[key];

      if (schemaProp.default !== undefined) {
        this[key] = schemaProp.type.copy(schemaProp.default, this[key]);
      } else {
        const type = schemaProp.type;
        this[key] = type.copy(type.default, this[key]);
      }
    }
  }

  /**
   * Put the component back into it's component pool
   * Called when component is removed from an entity
   */
  dispose ():void {
    if (this._pool) {
      this._pool.release(this);
    }
  }

  /**
   * Get the name of this component class
   * Useful for JSON serialization, etc
   */
  static getName () {
    return (this.constructor as any).getName();
  }

  /**
   * Make sure attributes on this component have been defined in the schema
   */
  checkUndefinedAttributes (src) {
    const schema = (this.constructor as ComponentConstructor<Component<C>>).schema;
    Object.keys(src).forEach(srcKey => {
      if (!schema[srcKey]) {
        console.warn(
          `Trying to set attribute '${srcKey}' not defined in the '${this.constructor.name}' schema. Please fix the schema, the attribute value won't be set`
        );
      }
    });
  }
}

Component.schema = {};
Component.getName = function () {
  return this.name;
};
