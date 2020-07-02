import AFRAME from 'aframe'
import { mappings, inputActions } from './input-mappings'
import 'aframe-input-mapping-component'

const RegisterAframeInput = (): void => {
  (AFRAME as any).registerInputActions(inputActions, 'default');
  (AFRAME as any).registerInputMappings(mappings)
}

export const AframeInputRegisterer = () => {
  RegisterAframeInput()

  return null
}

export default AframeInputRegisterer
