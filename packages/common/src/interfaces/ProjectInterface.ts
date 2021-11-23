export interface ProjectInterface {
  id: string
  name: string
  thumbnail: string
  storageProviderPath?: string // does not exist in local dev
  repositoryPath: string
}
