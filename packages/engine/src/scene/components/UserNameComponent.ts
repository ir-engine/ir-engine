import { createMappedComponent } from '../../ecs/ComponentFunctions'

export type UserNameComponentType = {
  username: string
}

export const UserNameComponent = createMappedComponent<UserNameComponentType>('UserNameComponent')
