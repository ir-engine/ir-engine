import React from 'react'
import { Drawer, Container } from '@mui/material'
import { AddCircleOutline } from '@mui/icons-material'
import { useHarmonyStyles } from '../style'
import { GroupService } from '@xrengine/client-core/src/social/services/GroupService'
import ModeContext from '../context/modeContext'
import GroupList from './GroupList'

const initialGroupForm = {
  id: '',
  name: '',
  groupUsers: [],
  description: ''
}

const initialSelectedUserState = {
  id: '',
  name: '',
  userRole: '',
  identityProviders: [],
  relationType: {},
  inverseRelationType: {},
  avatarUrl: ''
}

interface Props {
  setShowChat: any
  setInvite: any
  setCreate: any
  selfUser: any
}

const CreateGroup = (props: Props) => {
  const { setShowChat, setInvite, setCreate, selfUser } = props
  const classes = useHarmonyStyles()
  const { darkMode } = React.useContext(ModeContext)
  const [state, setState] = React.useState({ right: false })
  const [groupFormMode, setGroupFormMode] = React.useState('create')
  const [groupForm, setGroupForm] = React.useState(initialGroupForm)
  const [isUserRank, setIsUserRank] = React.useState('')
  const [anchorEl, setAnchorEl] = React.useState(null)
  const [detailsType, setDetailsType] = React.useState('')
  const [selectedGroup, setSelectedGroup] = React.useState(initialGroupForm)
  const [selectedUser, setSelectedUser] = React.useState(initialSelectedUserState)

  const handleClose = () => {
    setGroupForm(initialGroupForm)
    setGroupFormMode('create')
    // setSelectedGroup(initialGroupForm)
    setDetailsType('')
    setAnchorEl(null)
  }

  const handleUpdateClose = () => {
    setAnchorEl(null)
  }

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const openDetails = (e, type, object) => {
    handleClick(e)
    setDetailsType(type)
    setGroupFormMode('update')
    e.stopPropagation()
    if (type === 'user') {
      setSelectedUser(object)
    } else if (type === 'group') {
      const owner = object.groupUsers.find((el) => el.userId === selfUser.id)
      setIsUserRank(owner.groupUserRank)
      setSelectedGroup(object)
      setGroupForm({
        ...groupForm,
        name: object.name,
        description: object.description,
        id: object.id,
        groupUsers: object.groupUsers
      })
    }
  }
  const toggleUpdateDrawer = (anchor, open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return
    }

    setState({ ...state, [anchor]: open })
    handleUpdateClose()
  }

  const toggleDrawer = (anchor, open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return
    }
    setState({ ...state, [anchor]: open })
    handleClose()
  }

  const closeDrawer = (anchor, open) => {
    setState({ ...state, [anchor]: open })
  }

  const submitGroup = (e: any): void => {
    e.preventDefault()

    const group = {
      id: groupForm.id,
      name: groupForm.name,
      description: groupForm.description
    }

    if (groupFormMode === 'create') {
      delete group.id
      GroupService.createGroup(group)
    } else {
      GroupService.patchGroup(group)
    }
    setGroupForm(initialGroupForm)
    closeDrawer('right', false)
    setGroupFormMode('create')
  }

  const handleGroupCreateInput = (e: any): void => {
    const value = e.target.value
    const form = Object.assign({}, groupForm)
    form[e.target.name] = value
    setGroupForm(form)
  }

  return (
    <div>
      <div className={classes.center}>
        <a
          href="#"
          onClick={toggleDrawer('right', true)}
          className={`${classes.my2} ${classes.btn} ${darkMode ? classes.btnDark : classes.whiteBg}`}
        >
          <b>CREATE GROUP</b>
        </a>
        <Drawer anchor={'right'} open={state['right']} onClose={toggleDrawer('right', false)}>
          <Container
            className={darkMode ? classes.bgDark : classes.bgWhite}
            style={{ height: '100vh', overflowY: 'scroll' }}
          >
            <div className={`${classes.dFlex} ${classes.alignCenter} ${classes.p5}`}>
              <AddCircleOutline />
              &nbsp;&nbsp;&nbsp;&nbsp;
              <h1>{groupFormMode === 'create' ? 'CREATE' : 'UPDATE'} GROUP</h1>
            </div>
            <div className={classes.p5}>
              <form onSubmit={(e) => submitGroup(e)}>
                <div className="form-group">
                  <label htmlFor="" className={classes.mx2}>
                    <p>Name:</p>
                  </label>
                  <input
                    type="text"
                    className={darkMode ? classes.formControls : classes.formControlsLight}
                    id="name"
                    name="name"
                    value={groupForm.name}
                    autoFocus
                    placeholder="Enter group name"
                    onChange={(e) => handleGroupCreateInput(e)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="" className={classes.mx2}>
                    <p>Description:</p>
                  </label>
                  <input
                    type="text"
                    className={darkMode ? classes.formControls : classes.formControlsLight}
                    id="description"
                    name="description"
                    value={groupForm.description}
                    placeholder="Enter description"
                    onChange={(e) => handleGroupCreateInput(e)}
                  />
                </div>
                <div className={`${classes.dFlex} ${classes.my2}`} style={{ width: '100%' }}>
                  <button
                    className={`${classes.selfEnd} ${classes.roundedCircle} ${classes.borderNone} ${classes.mx2} ${classes.bgPrimary}`}
                  >
                    <b className={classes.white}>{groupFormMode === 'create' ? 'Create' : 'Update'} Group </b>
                  </button>
                </div>
              </form>
            </div>
          </Container>
        </Drawer>
      </div>
      <GroupList
        setShowChat={setShowChat}
        isUserRank={isUserRank}
        toggleUpdateDrawer={toggleUpdateDrawer}
        openDetails={openDetails}
        anchorEl={anchorEl}
        setAnchorEl={setAnchorEl}
        setInvite={setInvite}
        setCreate={setCreate}
        selfUser={selfUser}
        selectedGroup={selectedGroup}
        handleClose={handleClose}
      />
    </div>
  )
}

export default CreateGroup
