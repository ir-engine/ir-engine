export interface ProjectColumn {
  id: 'name' | 'update' | 'invalidate' | 'view' | 'action'
  label: string
  minWidth?: number
  align?: 'right'
}

export const projectsColumns: ProjectColumn[] = [
  { id: 'name', label: 'name', minWidth: 65 },
  { id: 'update', label: 'Update', minWidth: 65 },
  { id: 'invalidate', label: 'Invalidate Cache', minWidth: 65 },
  { id: 'view', label: 'View Project Files', minWidth: 65 },
  {
    id: 'action',
    label: 'Remove',
    minWidth: 65,
    align: 'right'
  }
]
