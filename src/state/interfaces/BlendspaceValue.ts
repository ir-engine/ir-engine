import Blendtype from "../types/BlendspaceType"

export default interface BlendspaceValue<T> {
  type: Blendtype
  value: T
}
