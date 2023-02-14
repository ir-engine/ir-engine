import React, { ReactNode } from 'react'

import { Typography as MuiTypography, TypographyProps } from '@mui/material'

const Typography = (props: TypographyProps & { component?: string }) => <MuiTypography {...props} />

Typography.displayName = 'Typography'

Typography.defaultProps = {
  children: "I'm typography"
}

export default Typography
