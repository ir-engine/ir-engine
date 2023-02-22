import React, { ReactNode } from 'react'

import { AvatarProps, Avatar as MuiAvatar } from '@mui/material'

const Avatar = (props: AvatarProps) => <MuiAvatar {...props} />

Avatar.displayName = 'Avatar'

Avatar.defaultProps = {}

export default Avatar
