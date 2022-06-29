export interface ProjectPermissionInterface {
  id: string
  projectId?: string
  userId?: string
  type?: string
  hasWriteAccess?: boolean
}
