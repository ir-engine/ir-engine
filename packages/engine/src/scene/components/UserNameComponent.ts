import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type UserNameComponentType = {
  username: string
}

export const UserNameComponent = createMappedComponent<UserNameComponentType>('UserNameComponent')
