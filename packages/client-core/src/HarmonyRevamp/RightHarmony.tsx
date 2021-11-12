import * as React from 'react'
import { Avatar, Grid } from '@mui/material'
import { useHarmonyStyles } from './style'

const RightHarmony = () => {
  const classes = useHarmonyStyles()
  return (
    <div>
      <h4>Media</h4>
      <small> 124 Pictures</small>
      <Grid container>
        <Grid item>
          <img src={'./download.jpeg'} />
        </Grid>
      </Grid>
    </div>
  )
}

export default RightHarmony
