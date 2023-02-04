import React from 'react'

import { CircularProgressProps, CircularProgress as MuiCircularProgress } from '@mui/material'

const CircularProgress = (props: CircularProgressProps & {}) => <MuiCircularProgress {...props} />

CircularProgress.displayName = 'CircularProgress'

CircularProgress.defaultProps = {}

export default CircularProgress
