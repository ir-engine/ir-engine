import AxisAlias from "../../axis/types/AxisAlias"

interface InputData {
  onAdded: [
    {
      behavior: any
      args?: any
    }
  ]
  onRemoved: [
    {
      behavior: any
      args?: any
    }
  ]
  eventBindings?: {
    [key: string]: {
      behavior: any
      args?: {
        [key: string]: any
      }
    }
  }
  mouseAxisBindings?: {
    buttons?: {
      [key: string]: AxisAlias
    }
    axes?: {
      [key: string]: AxisAlias
    }
  }
  gamepadAxisBindings?: {
    buttons?: {
      [key: string]: AxisAlias
    }
    axes?: {
      [key: string]: AxisAlias
    }
  }
  keyboardAxisBindings?: {
    [key: string]: AxisAlias
  }
}

export default InputData
