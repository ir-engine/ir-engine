import { PropType } from "./Types"

export type ComponentSchemaProp = {
  default?: any
  type: PropType<any, any>
}

export type ComponentSchema = {
  [propName: string]: ComponentSchemaProp
}

export interface ComponentConstructor<C extends Component<any>> {
  schema: ComponentSchema
  isComponent: true
  _typeId: any
  new (props?: Partial<Omit<C, keyof Component<any>>> | false): C
}

export class Component<C> {
  isComponent = true
  static schema: ComponentSchema
  static isComponent: true
  static _typeId: number
  _pool: any
  _typeId: any
  constructor(props?: Partial<Omit<C, keyof Component<any>>> | false) {
    if (props !== false) {
      const schema = (this.constructor as ComponentConstructor<Component<C>>).schema
      Component.schema = schema
      for (const key in schema) {
        if (props && props["key"] != undefined) {
          this[key] = props[key]
        } else {
          const schemaProp = schema[key]
          if (schemaProp["default"] !== undefined) {
            this[key] = schemaProp.type.clone(schemaProp.default)
          } else {
            const type = schemaProp.type
            this[key] = type.clone(type.default)
          }
        }
      }

      if (process.env.NODE_ENV !== "production" && props !== undefined) {
        this.checkUndefinedAttributes(props)
      }
    }

    this._pool = null
  }

  copy(source) {
    const schema = (this.constructor as ComponentConstructor<Component<C>>).schema

    for (const key in schema) {
      const prop = schema[key]

      if (source[key] !== undefined) {
        this[key] = prop.type.copy(source[key], this[key])
      }
    }

    // @DEBUG
    if (process.env.NODE_ENV !== "production") {
      this.checkUndefinedAttributes(source)
    }

    return this
  }

  clone() {
    return new Component<C>().copy(this)
  }

  reset() {
    const schema = (this.constructor as ComponentConstructor<Component<C>>).schema

    for (const key in schema) {
      const schemaProp = schema[key]

      if (schemaProp["default"] !== undefined) {
        this[key] = schemaProp.type.copy(schemaProp.default, this[key])
      } else {
        const type = schemaProp.type
        this[key] = type.copy(type.default, this[key])
      }
    }
  }

  dispose() {
    if (this._pool) {
      this._pool.release(this)
    }
  }

  getName() {
    return this.getName()
  }

  checkUndefinedAttributes(src) {
    const schema = (this.constructor as ComponentConstructor<Component<C>>).schema

    // Check that the attributes defined in source are also defined in the schema
    Object.keys(src).forEach(srcKey => {
      if (!schema[srcKey]) {
        console.warn(
          `Trying to set attribute '${srcKey}' not defined in the '${this.constructor.name}' schema. Please fix the schema, the attribute value won't be set`
        )
      }
    })
  }
}
