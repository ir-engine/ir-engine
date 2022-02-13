export interface RouteColumn {
  id: 'project' | 'route' | 'active'
  label: string
  minWidth?: number
  align?: 'right'
}

export const routeColumns: RouteColumn[] = [
  { id: 'project', label: 'Project', minWidth: 65 },
  { id: 'route', label: 'Route', minWidth: 65 },
  {
    id: 'active',
    label: 'Active',
    minWidth: 65,
    align: 'right'
  }
]
