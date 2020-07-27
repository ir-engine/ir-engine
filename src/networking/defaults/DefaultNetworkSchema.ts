import DefaultMessageTypes from "./DefaultMessageTypes"
import DefaultMessageSchemas from "./DefaultMessageSchemas"

const DefaultNetworkSessionSchema = {
  // Called by input system when an Input component is added
  onAdded: [],
  // Called by input system when on Input component is removed
  onRemoved: [],
  messageSchemas: {
    [DefaultMessageTypes.ComponentDataUpdate]: HandleComponentUpdate
  }
}

export default DefaultNetworkSessionSchema
