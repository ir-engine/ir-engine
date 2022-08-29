export interface ProjectColumn {
  id: 'name' | 'reset' | 'update' | 'invalidate' | 'view' | 'action' | 'link' | 'push' | 'projectPermissions'
  label: string
  minWidth?: number
  align?: 'right' | 'center'
}

export const projectsColumns: ProjectColumn[] = [
  { id: 'name', label: 'Name', minWidth: 65 },
  { id: 'update', label: 'Update', minWidth: 65, align: 'center' },
  { id: 'push', label: 'Push to GitHub', minWidth: 65, align: 'center' },
  { id: 'link', label: 'GitHub Repo Link', minWidth: 65, align: 'center' },
  { id: 'projectPermissions', label: 'User Access', minWidth: 65, align: 'center' },
  { id: 'invalidate', label: 'Invalidate Cache', minWidth: 65, align: 'center' },
  { id: 'view', label: 'View Project Files', minWidth: 65, align: 'center' },
  { id: 'reset', label: 'Reset', minWidth: 65, align: 'center' },
  {
    id: 'action',
    label: 'Remove',
    minWidth: 65,
    align: 'center'
  }
]
