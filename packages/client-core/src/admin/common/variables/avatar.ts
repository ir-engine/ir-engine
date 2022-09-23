import { AvatarInterface } from '@xrengine/common/src/interfaces/AvatarInterface'

export interface AvatarColumn {
  id: 'select' | 'id' | 'name' | 'thumbnail' | 'action'
  label: string | React.ReactElement
  minWidth?: number
  align?: 'right'
}

export const avatarColumns: AvatarColumn[] = [
  { id: 'id', label: 'Id', minWidth: 65 },
  { id: 'name', label: 'Name', minWidth: 65 },
  {
    id: 'thumbnail',
    label: 'Thumbnail',
    minWidth: 65,
    align: 'right'
  },
  {
    id: 'action',
    label: 'Action',
    minWidth: 65,
    align: 'right'
  }
]

export interface AvatarData {
  el: AvatarInterface
  select: JSX.Element
  id: string
  name: string | undefined
  action: JSX.Element
  thumbnail: JSX.Element
}
