import ActionMapping from "./ActionMapping"

const key: unique symbol = Symbol()

interface ActionMap {
  [key]?: ActionMapping
}

export default ActionMap
