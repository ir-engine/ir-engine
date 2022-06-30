export interface InviteColumn {
  id: 'id' | 'name' | 'passcode' | 'type' | 'action' | 'select' | 'spawnType' | 'spawnDetails' | 'targetObjectId'
  label: string
  minWidth?: number
  align?: 'right' | 'center'
}

export const inviteColumns: InviteColumn[] = [
  {
    id: 'id',
    label: 'Id',
    minWidth: 65
  },
  {
    id: 'name',
    label: 'Name',
    minWidth: 80,
    align: 'center'
  },
  {
    id: 'passcode',
    label: 'Passcode',
    minWidth: 65,
    align: 'right'
  },
  {
    id: 'type',
    label: 'Type',
    minWidth: 65,
    align: 'center'
  },
  {
    id: 'targetObjectId',
    label: 'Target ID',
    minWidth: 65,
    align: 'center'
  },
  {
    id: 'spawnType',
    label: 'Spawn type',
    minWidth: 65,
    align: 'center'
  },
  {
    id: 'spawnDetails',
    label: 'Spawn Details',
    minWidth: 65,
    align: 'center'
  },
  {
    id: 'select',
    label: 'Select',
    minWidth: 65
  },
  {
    id: 'action',
    label: 'Action',
    minWidth: 65,
    align: 'right'
  }
]
