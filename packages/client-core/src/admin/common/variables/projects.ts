export interface ProjectColumn {
  id: 'name' | 'update' | 'invalidate' | 'view' | 'action'
  label: string
  minWidth?: number
  align?: 'right' | 'center'
}

export const projectsColumns: ProjectColumn[] = [
  { id: 'name', label: 'Name', minWidth: 65 },
  { id: 'update', label: 'Update', minWidth: 65, align: 'center' },
  { id: 'invalidate', label: 'Invalidate Cache', minWidth: 65, align: 'center' },
  { id: 'view', label: 'View Project Files', minWidth: 65, align: 'center' },
  {
    id: 'action',
    label: 'Remove',
    minWidth: 65,
    align: 'center'
  }
]
