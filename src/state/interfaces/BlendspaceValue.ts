import Blendtype from "../types/StateAlias"

export default interface StateValue<T> {
  type: Blendtype
  value: T
}
