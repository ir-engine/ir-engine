import React, { useContext } from 'react'
import { Container, Avatar, Drawer } from '@mui/material'
import { useHarmonyStyles } from '../style'
import ModeContext from '../context/modeContext'
import { AddCircleOutline } from '@mui/icons-material'
import { Delete } from '@material-ui/icons'

interface Props {
  selectedParty: any
  selfUser: any
  openDrawer: boolean
  setOpenDrawer: any
}

const ViewMembers = ({ selectedParty, selfUser, openDrawer, setOpenDrawer }: Props) => {
  const { darkMode } = useContext(ModeContext)
  const classes = useHarmonyStyles()
  //   const [openDrawer, setOpenDrawer] = React.useState(false)
  console.log(selectedParty)
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
                {selectedParty && selectedParty.name.toUpperCase()}{' '}
                <small>&nbsp;&nbsp; {selectedParty && selectedParty.partyUsers?.length} Members (s)</small>
              </h1>
            </div>
            {selectedParty &&
              selectedParty.partyUsers?.length > 0 &&
              selectedParty.partyUsers
                .map((partyUser) => partyUser) //Makes a copy of the state; otherwise, .sort attempts to alter state directly, which hookState throws errors on
                .sort((a, b) => a.name - b.name)
                .map((partyUser) => {
                  return (
                    <div
                      key={partyUser.id}
                      className={`${classes.dFlex} ${classes.justifyContentBetween} ${classes.alignCenter} ${classes.my2} ${classes.p5}`}
                    >
                      <div className={`${classes.dFlex} ${classes.alignCenter}`}>
                        <Avatar src={partyUser.avatarUrl} />
                        {selfUser.id === partyUser.user.id && (
                          <div className={classes.mx2}>
                            <h4 className={classes.fontBig}>{partyUser.user.name + ' (you)'}</h4>
                          </div>
                        )}
                        {selfUser.id !== partyUser.user.id && (
                          <div className={classes.mx2}>
                            <h4 className={classes.fontBig}>{partyUser.user.name}</h4>
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
