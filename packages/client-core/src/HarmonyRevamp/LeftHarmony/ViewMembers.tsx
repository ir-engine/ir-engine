import React, { useContext } from 'react'
import { Container, Avatar, Drawer } from '@mui/material'
import { useHarmonyStyles } from '../style'
import ModeContext from '../context/modeContext'
import { AddCircleOutline } from '@mui/icons-material'
import { Delete } from '@material-ui/icons'

interface Props {
  selectedGroup: any
  selfUser: any
  openDrawer: boolean
  setOpenDrawer: any
}

const ViewMembers = ({ selectedGroup, selfUser, openDrawer, setOpenDrawer }: Props) => {
  const { darkMode } = useContext(ModeContext)
  const classes = useHarmonyStyles()
  //   const [openDrawer, setOpenDrawer] = React.useState(false)

  return (
    <div>
      <Drawer
        anchor={'right'}
        open={openDrawer}
        onClose={() => {
          setOpenDrawer(false)
        }}
      >
        {openDrawer && (
          <Container
            className={darkMode ? classes.bgDark : classes.bgLight}
            style={{ height: '100vh', overflowY: 'scroll' }}
          >
            <div className={`${classes.dFlex} ${classes.alignCenter} ${classes.p5}`}>
              <AddCircleOutline />
              &nbsp;&nbsp;&nbsp;&nbsp;
              <h1>
                {selectedGroup && selectedGroup.name.toUpperCase()}{' '}
                <small>&nbsp;&nbsp; {selectedGroup && selectedGroup.groupUsers?.length} Members (s)</small>
              </h1>
            </div>
            {selectedGroup &&
              selectedGroup.groupUsers?.length > 0 &&
              selectedGroup.groupUsers
                .map((groupUser) => groupUser) //Makes a copy of the state; otherwise, .sort attempts to alter state directly, which hookState throws errors on
                .sort((a, b) => a.name - b.name)
                .map((groupUser) => {
                  return (
                    <div
                      key={groupUser.id}
                      className={`${classes.dFlex} ${classes.justifyContentBetween} ${classes.alignCenter} ${classes.my2} ${classes.p5}`}
                    >
                      <div className={`${classes.dFlex} ${classes.alignCenter}`}>
                        <Avatar src={groupUser.avatarUrl} />
                        {selfUser.id === groupUser.user.id && (
                          <div className={classes.mx2}>
                            <h4 className={classes.fontBig}>{groupUser.user.name + ' (you)'}</h4>
                          </div>
                        )}
                        {selfUser.id !== groupUser.user.id && (
                          <div className={classes.mx2}>
                            <h4 className={classes.fontBig}>{groupUser.user.name}</h4>
                          </div>
                        )}
                      </div>
                      <a href="#" className={classes.border0}>
                        <Delete fontSize="small" className={classes.danger} />
                      </a>
                    </div>
                  )
                })}
          </Container>
        )}
      </Drawer>
    </div>
  )
}

export default ViewMembers
