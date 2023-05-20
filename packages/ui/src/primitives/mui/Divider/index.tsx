import React, { ReactNode } from 'react'

import { DividerProps, Divider as MuiDivider } from '@mui/material'

const Divider = (props: DividerProps & { component?: string }) => <MuiDivider {...props} />

Divider.displayName = 'Divider'

Divider.defaultProps = { children: null }

export default Divider
