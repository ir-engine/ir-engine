import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type LinkComponentType = {
  href: string
}

export const LinkComponent = createMappedComponent<LinkComponentType>('LinkComponent')
