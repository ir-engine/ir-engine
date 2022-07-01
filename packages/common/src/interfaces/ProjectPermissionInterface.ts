import { UserInterface } from '../dbmodels/UserInterface'

export interface ProjectPermissionInterface {
  id: string
  projectId: string
  userId: string
  type: string
  user: UserInterface
}
