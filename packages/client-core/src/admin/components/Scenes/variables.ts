export interface SceneColumn {
  id: 'name' | 'description' | 'type' | 'entity' | 'version' | 'action'
  label: string
  minWidth?: number
  align?: 'right'
}

export const sceneColumns: SceneColumn[] = [
  { id: 'name', label: 'Name', minWidth: 150 },
  { id: 'description', label: 'Description', minWidth: 100 },
  {
    id: 'type',
    label: 'Type',
    minWidth: 150,
    align: 'right'
  },
  {
    id: 'entity',
    label: 'Entity',
    minWidth: 150,
    align: 'right'
  },
  {
    id: 'version',
    label: 'Version',
    minWidth: 150,
    align: 'right'
  },
  {
    id: 'action',
    label: 'Action',
    minWidth: 150,
    align: 'right'
  }
]

export interface SceneData {
  id: string
  name: string
  description: string
  type: string
  entity: any
  version: any
  action: any
}

export interface EntityColumn {
  id: 'name' | 'index' | 'components'
  label: string
  minWidth?: number
  align?: 'right'
}

export const entityColumns: EntityColumn[] = [
  { id: 'name', label: 'Name', minWidth: 150 },
  { id: 'index', label: 'Index', minWidth: 100 },
  {
    id: 'components',
    label: 'Components',
    minWidth: 100,
    align: 'right'
  }
]

export interface EntityData {
  id: string
  name: string
  index: string
  components: any
}
