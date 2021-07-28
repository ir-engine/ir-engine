export interface Column {
  id: 'Featured by Admin' | 'preview' | 'video' | 'details' | 'creator' | 'created' | 'action'
  label: string
  minWidth?: number
  align?: 'right'
}

export const columns: Column[] = [
  { id: 'Featured by Admin', label: 'Featured By Admin', minWidth: 170 },
  { id: 'preview', label: 'Preview', minWidth: 100 },
  {
    id: 'video',
    label: 'Video',
    minWidth: 170,
    align: 'right'
  },
  {
    id: 'details',
    label: 'Details',
    minWidth: 170,
    align: 'right'
  },
  {
    id: 'creator',
    label: 'Creator',
    minWidth: 170,
    align: 'right'
  },
  {
    id: 'created',
    label: 'Created',
    minWidth: 170,
    align: 'right'
  },
  {
    id: 'action',
    label: 'Action',
    minWidth: 170,
    align: 'right'
  }
]

export interface Data {
  id: string
  featured: string
  preview: string
  video: string
  creator: string
  created: string
  action: any
}
