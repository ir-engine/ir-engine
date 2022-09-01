import { UserInterface } from './User'

export interface Relationship {
  userId: string
  friend: UserInterface[]
  requested: UserInterface[]
  pending: UserInterface[]
  blocking: UserInterface[]
  blocked: UserInterface[]
}
