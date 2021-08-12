import { ComponentConstructor } from '../../ecs/interfaces/ComponentInterfaces'

/** Interface for Network schema. */
export interface NetworkSchema {
  /** Transporter of the message. */
  transport: any
  /** List of supported message types. */
  messageTypes: {
    [key: string]: any
  }
  /** Prefabs for the schema. */
  prefabs: Map<number, ComponentConstructor<any>>
}
