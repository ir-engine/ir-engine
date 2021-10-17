import { ProjectInterface } from './ProjectInterface'

export type ProjectResult = {
  data: ProjectInterface[]
  total: number
  limit: number
  skip: number
}
