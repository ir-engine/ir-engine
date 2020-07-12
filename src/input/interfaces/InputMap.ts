import AxisAlias from "../../axis/types/AxisAlias"

interface InputMap {
  // Called by input system when an Input component is added
  onAdded: [
    {
      behavior: any
      args?: any
    }
  ]
  // Called by input system when on Input component is removed
  onRemoved: [
    {
      behavior: any
      args?: any
    }
  ]
  // Bound to events on added, unbound on removed
  eventBindings?: {
    [key: string]: {
      behavior: any
      args?: {
        [key: string]: any
      }
    }
  }
  mouseAxisMap?: {
    buttons?: {
      [key: string]: AxisAlias
      [key: number]: AxisAlias
    }
    axes?: {
      [key: string]: AxisAlias
      [key: number]: AxisAlias
    }
  }
  gamepadAxisMap?: {
    buttons?: {
      [key: string]: AxisAlias
      [key: number]: AxisAlias
    }
    axes?: {
      [key: string]: AxisAlias
      [key: number]: AxisAlias
    }
  }
  keyboardAxisMap?: {
    [key: string]: AxisAlias
    [key: number]: AxisAlias
  }
}

export default InputMap
