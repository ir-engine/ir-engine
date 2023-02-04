import React, { ReactNode } from 'react'

import { AvatarProps, Avatar as MuiAvatar } from '@mui/material'

const Avatar = (props: AvatarProps) => <MuiAvatar {...props} />

Avatar.displayName = 'Avatar'

Avatar.defaultProps = {
  alt: 'User',
  src: 'https://avatars.githubusercontent.com/u/61642798?s=200&v=4'
}

export default Avatar
