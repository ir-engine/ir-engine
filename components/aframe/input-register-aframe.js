import { mappings, inputActions } from './input-mappings.js'
export default function () {
    AFRAME.registerInputActions(inputActions, 'default')
    AFRAME.registerInputMappings(mappings)
}