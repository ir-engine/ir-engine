import { UserInterface } from './User'

export interface Relationship {
  userId: string
  friend: UserInterface[]
  requested: UserInterface[]
  blocking: UserInterface[]
  blocked: UserInterface[]
}
