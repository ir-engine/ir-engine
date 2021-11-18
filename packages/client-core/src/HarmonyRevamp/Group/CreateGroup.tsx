import React, { useContext } from 'react'
import { Delete } from '@material-ui/icons'
import { AddCircleOutline } from '@mui/icons-material'
import { Container, Avatar, Drawer } from '@mui/material'
import { useHarmonyStyles } from '../style'
import ModeContext from '../context/modeContext'

interface Props {
  openCreateDrawer: any
  handleCloseCreateDrawer: any
}

const CreateGroup = (props: Props) => {
  const { darkMode } = useContext(ModeContext)

  console.log('Dark Mode', darkMode)
  const classes = useHarmonyStyles()
  const { openCreateDrawer, handleCloseCreateDrawer } = props

  return (
    <Drawer anchor={'right'} open={openCreateDrawer} onClose={() => handleCloseCreateDrawer()}>
      <Container
        className={darkMode ? classes.bgDark : classes.bgWhite}
        style={{ height: '100vh', overflowY: 'scroll' }}
      >
        <div className={`${classes.dFlex} ${classes.alignCenter} ${classes.p5}`}>
          <AddCircleOutline />
          &nbsp;&nbsp;&nbsp;&nbsp;
          <h1>CREATE GROUP</h1>
        </div>
        <div className={classes.p5}>
          <form>
            <div className="form-group">
              <label htmlFor="" className={classes.mx2}>
                <p>Name:</p>
              </label>
              <input
                type="text"
                className={darkMode ? classes.formControls : classes.formControlsLight}
                placeholder="Enter group name"
              />
            </div>
            <div className="form-group">
              <label htmlFor="" className={classes.mx2}>
                <p>Description:</p>
              </label>
              <input
                type="text"
                className={darkMode ? classes.formControls : classes.formControlsLight}
                placeholder="Enter description"
              />
            </div>
            <div className={`${classes.dFlex} ${classes.my2}`} style={{ width: '100%' }}>
              <button
                className={`${classes.selfEnd} ${classes.roundedCircle} ${classes.borderNone} ${classes.mx2} ${classes.bgPrimary}`}
              >
                <b className={classes.white}>Create Now</b>
              </button>
            </div>
          </form>
        </div>
      </Container>
    </Drawer>
  )
}

export default CreateGroup
