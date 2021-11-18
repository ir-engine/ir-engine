import React, { useContext } from 'react'
import { Delete } from '@material-ui/icons'
import { AddCircleOutline } from '@mui/icons-material'
import { Container, Avatar, Drawer } from '@mui/material'
import { useHarmonyStyles } from '../style'
import ModeContext from '../context/modeContext'

interface Props {
  openDrawer: any
  handleCloseDrawer: any
}

const GroupMembers = (props: Props) => {
  const { darkMode } = useContext(ModeContext)
  const { openDrawer, handleCloseDrawer } = props
  const classes = useHarmonyStyles()

  return (
    <Drawer anchor={'right'} open={openDrawer} onClose={() => handleCloseDrawer()}>
      <Container className={classes.bgWhite} style={{ height: '100vh', overflowY: 'scroll' }}>
        <div className={`${classes.dFlex} ${classes.alignCenter} ${classes.p5}`}>
          <AddCircleOutline />
          &nbsp;&nbsp;&nbsp;&nbsp;
          <h1>
            GROUP TEST 1 <small>&nbsp;&nbsp; 12 Members (s)</small>
          </h1>
        </div>
        <div
          className={`${classes.dFlex} ${classes.justifyContentBetween} ${classes.alignCenter} ${classes.my2} ${classes.p5}`}
        >
          <div className={`${classes.dFlex} ${classes.alignCenter}`}>
            <Avatar src="./Avatar.png" />
            <div className={classes.mx2}>
              <h4 className={classes.fontBig}>John laouireen</h4>
            </div>
          </div>
          <a href="#" className={classes.border0}>
            <Delete fontSize="small" className={classes.danger} />
          </a>
        </div>
      </Container>
    </Drawer>
  )
}

export default GroupMembers
