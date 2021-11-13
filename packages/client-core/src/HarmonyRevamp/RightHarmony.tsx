import * as React from 'react'
import { Avatar, Grid } from '@mui/material'
import { useHarmonyStyles } from './style'
import { Download } from '@mui/icons-material'

const RightHarmony = () => {
  const classes = useHarmonyStyles()
  return (
    <div>
      <h4>
        Media &nbsp; <small> 124 Pictures</small>
      </h4>

      <Grid container spacing={3}>
        <Grid item xs={6}>
          {/* <img src={require('./download.jpeg')} alt="" /> */}
        </Grid>
        <Grid item xs={6}>
          {/* <img src={require('./download.jpeg')} alt="" /> */}
        </Grid>
        <Grid item xs={6}>
          {/* <img src={require('./download.jpeg')} alt="" /> */}
        </Grid>
        <Grid item xs={6}>
          {/* <img src={require('./download.jpeg')} alt="" /> */}
        </Grid>
      </Grid>

      <h4 className={classes.my2}>
        Shared Files &nbsp; <small> 12 File (s)</small>
      </h4>
      <div className={`${classes.dFlex} ${classes.justifyContentBetween} ${classes.alignCenter}`}>
        <div className={`${classes.dFlex} ${classes.mx2} ${classes.my2}`}>
          <div className={classes.mx2}>
            <h4 className={classes.fontBig}>Dwark Matths</h4>
            <small className={classes.textMuted}>12 Aug 2021 . </small>
            <small className={classes.textMuted}>482 KB</small>
          </div>
        </div>
        <Download fontSize="small" />
      </div>
      <div className={`${classes.dFlex} ${classes.justifyContentBetween} ${classes.alignCenter}`}>
        <div className={`${classes.dFlex} ${classes.mx2} ${classes.my2}`}>
          <div className={classes.mx2}>
            <h4 className={classes.fontBig}>Dwark Matths</h4>
            <small className={classes.textMuted}>12 Aug 2021 . </small>
            <small className={classes.textMuted}>482 KB</small>
          </div>
        </div>
        <Download fontSize="small" />
      </div>
      <div className={`${classes.dFlex} ${classes.justifyContentBetween} ${classes.alignCenter}`}>
        <div className={`${classes.dFlex} ${classes.mx2} ${classes.my2}`}>
          <div className={classes.mx2}>
            <h4 className={classes.fontBig}>Dwark Matths</h4>
            <small className={classes.textMuted}>12 Aug 2021 . </small>
            <small className={classes.textMuted}>482 KB</small>
          </div>
        </div>
        <Download fontSize="small" />
      </div>
      <div className={classes.center}>
        <a href="#" className={`${classes.my2} ${classes.btn}`}>
          View more
        </a>
      </div>
    </div>
  )
}

export default RightHarmony
