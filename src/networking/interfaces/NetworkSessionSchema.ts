import TransportAlias from "../types/TransportAlias";

export default interface NetworkSessionSchema {
  transport: TransportAlias
  // Called by input system when an Input component is added
  onAdded: [
    {
      behavior: any // Function
      args?: {
        [key: string]: any
      }
    }
  ]
  // Called by input system when on Input component is removed
  onRemoved: [
    {
      behavior: any // Function
      args?: {
        [key: string]: any
      }
    }
  ]
  messageSchemas: {
    [key: number]: {
      behavior: any
      args: {
        [key: string]: any
      }
    }
  }
}
