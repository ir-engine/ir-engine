export interface Column {
  id: 'name' | 'username' | 'email' | 'link' | 'description' | 'avatarId' | 'socialMedia' | 'action'
  label: string
  minWidth?: number
  align?: 'right'
}

export const columns: Column[] = [
  { id: 'name', label: 'Name', minWidth: 150 },
  { id: 'username', label: 'Username', minWidth: 100 },
  {
    id: 'email',
    label: 'E-mail',
    minWidth: 150,
    align: 'right'
  },
  {
    id: 'link',
    label: 'Link',
    minWidth: 150,
    align: 'right'
  },
  {
    id: 'description',
    label: 'Description',
    minWidth: 150,
    align: 'right'
  },
  {
    id: 'avatarId',
    label: 'AvatarId',
    minWidth: 150,
    align: 'right'
  },
  {
    id: 'socialMedia',
    label: 'Social Media',
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

export interface Data {
  id: string
  name: string
  username: string
  email: string
  link: string
  description: any
  avatarId: string
  socialMedia: any
  action: any
}
