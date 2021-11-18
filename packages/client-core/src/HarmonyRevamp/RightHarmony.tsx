import * as React from 'react'
import { Avatar, Grid } from '@mui/material'
import { useHarmonyStyles } from './style'
import { Download } from '@mui/icons-material'
import ModeContext from './context/modeContext'
import Image1 from '../../../client/public/static/download.jpeg'
import Image2 from '../../../client/public/static/download (1).jpeg'
import Image3 from '../../../client/public/static/images.jpeg'

const RightHarmony = () => {
  const { darkMode } = React.useContext(ModeContext)
  const classes = useHarmonyStyles()
  return (
    <div>
      <h4 className={`${!darkMode ? classes.textBlack : classes.white} ${classes.mx2}`}>
        <b>Media</b> &nbsp; <small> 124 Pictures</small>
      </h4>

      <Grid container spacing={3}>
        <Grid item xs={6}>
          <img src={Image1} style={{ width: '100%', objectFit: 'fill' }} alt="" />
        </Grid>
        <Grid item xs={6}>
          <img src={Image2} style={{ width: '100%', objectFit: 'fill' }} alt="" />
        </Grid>
        <Grid item xs={6}>
          <img src={Image3} style={{ width: '100%', objectFit: 'fill' }} alt="" />
        </Grid>
        <Grid item xs={6}>
          <a href="#" className={`${classes.dFlex} ${classes.alignCenter} ${classes.justifyCenter} ${classes.bigBox} `}>
            <h1 className={classes.bigFont}>
              <b>120</b> <br /> <b>Photos</b>
            </h1>
          </a>
        </Grid>
      </Grid>

      <h4 className={`${classes.my2} ${!darkMode ? classes.textBlack : classes.white}`}>
        <b>Shared Files</b> &nbsp; <small> 12 File (s)</small>
      </h4>
      <div className={`${classes.dFlex} ${classes.justifyContentBetween} ${classes.alignCenter}`}>
        <div className={`${classes.dFlex} ${classes.mx2} ${classes.my2}`}>
          <div className={classes.mx2}>
            <h4 className={`${classes.fontBig} ${!darkMode ? classes.textBlack : classes.white}`}>Dwark Matths</h4>
            <small className={classes.textMuted}>12 Aug 2021 . </small>
            <small className={classes.textMuted}>482 KB</small>
          </div>
        </div>
        <a href="#" className="btn">
          <Download fontSize="small" className={!darkMode && classes.secondaryText} />
        </a>
      </div>
      <div className={`${classes.dFlex} ${classes.justifyContentBetween} ${classes.alignCenter}`}>
        <div className={`${classes.dFlex} ${classes.mx2} ${classes.my2}`}>
          <div className={classes.mx2}>
            <h4 className={`${classes.fontBig} ${!darkMode ? classes.textBlack : classes.white}`}>Dwark Matths</h4>
            <small className={classes.textMuted}>12 Aug 2021 . </small>
            <small className={classes.textMuted}>482 KB</small>
          </div>
        </div>
        <a href="#" className="btn">
          <Download fontSize="small" className={!darkMode && classes.secondaryText} />
        </a>
      </div>
      <div className={`${classes.dFlex} ${classes.justifyContentBetween} ${classes.alignCenter}`}>
        <div className={`${classes.dFlex} ${classes.mx2} ${classes.my2}`}>
          <div className={classes.mx2}>
            <h4 className={`${classes.fontBig} ${!darkMode ? classes.textBlack : classes.white}`}>Dwark Matths</h4>
            <small className={classes.textMuted}>12 Aug 2021 . </small>
            <small className={classes.textMuted}>482 KB</small>
          </div>
        </div>
        <a href="#" className="btn">
          <Download fontSize="small" className={!darkMode && classes.secondaryText} />
        </a>
      </div>
      <div className={classes.center}>
        <a href="#" className={`${classes.my2} ${classes.btn} ${darkMode ? classes.btnDark : classes.whiteBg}`}>
          View more
        </a>
      </div>
    </div>
  )
}

export default RightHarmony
