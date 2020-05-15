import { User } from './User'

export type Relationship = {
  userId: string
  friend: User[]
  requested: User[]
  blocked: User[]
}

export const RelationshipSeed: Relationship = {
  userId: '',
  friend: [],
  requested: [],
  blocked: []
}
