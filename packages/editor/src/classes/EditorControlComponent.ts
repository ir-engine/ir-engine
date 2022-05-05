import { createMappedComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'

export type EditorControlComponentType = {}

export const EditorControlComponent = createMappedComponent<EditorControlComponentType>('FlyControlComponent')
