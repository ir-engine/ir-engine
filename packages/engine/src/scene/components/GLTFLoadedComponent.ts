import { ComponentType, createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export const GLTFLoadedComponent = createMappedComponent<ComponentType<any>[]>('GLTFLoadedComponent')
