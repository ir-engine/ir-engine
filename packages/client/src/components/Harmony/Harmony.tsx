import React from 'react'
import LeftHarmony from '@xrengine/client-core/src/harmony/components/leftHamony'
import RightHarmony from '@xrengine/client-core/src/harmony/components/rightHarmony'
import Grid from '@mui/material/Grid'

export default function Harmony() {
  return (
    <div style={{ backgroundColor: '#15171B' }}>
      <Grid container spacing={0}>
        <Grid item xs={6} md={3}>
          <LeftHarmony />
        </Grid>
        <Grid item xs={6} md={9}>
          <RightHarmony />
        </Grid>
      </Grid>
    </div>
  )
}
