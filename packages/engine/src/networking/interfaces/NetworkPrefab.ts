/** Interface for network component. */
interface NetworkComponentInterface {
  /** Type of the component. */
  type: any
  /** Data of the component. */
  data?: any
  /** Network attributes. */
  networkedAttributes?: {
    /** Key is name of network attribute. */
    [key: string]: any
  }
}

/** Interface for Network prefab. */
export interface NetworkPrefab {
    /** Called to create a new instance of the prefab */
    initialize?: (args: {}) => void

    /** List of Components to be implemented on Entity. */
    localClientComponents?: Array<{
      /** Type of Component. */
      type: any
      /** State of the Component. */
      data?: any
    }>
  
    /** Call before Creation of Entity from this Prefab. */
    onBeforeCreate?: any[]
    /** Call after Creation of Entity from this Prefab. */
    onAfterCreate?: any[]
    /** Call before destruction of Entity created from this Prefab. */
    onBeforeDestroy?: any[]
    /** Call after destruction of Entity created from this Prefab. */
    onAfterDestroy?: any[]
  /** List of only client components. */
  clientComponents: Array<NetworkComponentInterface>
  /** List of network components. */
  networkComponents: Array<NetworkComponentInterface>
  /** List of server components. */
  serverComponents: Array<NetworkComponentInterface>
}