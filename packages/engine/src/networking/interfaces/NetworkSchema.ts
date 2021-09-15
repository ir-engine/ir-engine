import { ComponentConstructor } from '../../ecs/functions/ComponentFunctions'

/** Interface for Network schema. */
export interface NetworkSchema {
  /** Transporter of the message. */
  transport: any
  /** List of supported message types. */
  messageTypes: {
    [key: string]: any
  }
  /** Prefabs for the schema. */
  prefabs: Map<string, ComponentConstructor<any, any>>
}
