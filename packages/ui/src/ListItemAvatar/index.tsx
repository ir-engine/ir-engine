import React, { ReactNode } from 'react'

import { ListItemAvatarProps, ListItemAvatar as MuiListItemAvatar } from '@mui/material'

const ListItemAvatar = (props: ListItemAvatarProps) => <MuiListItemAvatar {...props} />

ListItemAvatar.displayName = 'ListItemAvatar'

ListItemAvatar.defaultProps = { children: null }

export default ListItemAvatar
