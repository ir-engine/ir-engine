import React, { useState, useContext } from 'react'
import { InviteService, useInviteState } from '@xrengine/client-core/src/social/services/InviteService'
import { useGroupState } from '@xrengine/client-core/src/social/services/GroupService'
import ModeContext from '../context/modeContext'
import { useHarmonyStyles } from '../style'
import { FormControl, MenuItem, Select } from '@mui/material'

interface Props {
  handleCloseModal: any
}

const Group = (props: Props) => {
  const { handleCloseModal } = props
  const { darkMode } = useContext(ModeContext)
  const classes = useHarmonyStyles()
  const [type, setType] = React.useState('email')

  const [tabIndex, setTabIndex] = useState(0)
  const [userToken, setUserToken] = useState('')
  const [group, setGroup] = useState('1')
  const [inviteTypeIndex, setInviteTypeIndex] = useState(0)
  const inviteState = useInviteState()
  const groupState = useGroupState()
  const invitableGroupState = groupState.invitableGroups
  const invitableGroups = invitableGroupState.groups

  const identityProviderTabMap = new Map()
  identityProviderTabMap.set(0, 'email')
  identityProviderTabMap.set(1, 'sms')

  const handleUserTokenChange = (event: any): void => {
    setUserToken(event.target.value)
  }

  const handleChange = (event: any, newValue: number): void => {
    event.preventDefault()
    setTabIndex(newValue)
    setUserToken('')
  }

  const handleInviteGroupChange = (event: React.ChangeEvent<{ value: string }>): void => {
    InviteService.updateInviteTarget('group', event.target.value)
  }

  const handleInviteTypeChange = (e: any, newValue: number): void => {
    e.preventDefault()
    setInviteTypeIndex(newValue)
    if (newValue === 0 && tabIndex === 3) {
      setTabIndex(0)
    }
  }

  const packageInvite = async (event: any): Promise<void> => {
    //const mappedIDProvider = identityProviderTabMap.get(tabIndex)
    const mappedIDProvider = type
    event.preventDefault()
    const sendData = {
      type: 'group',
      token: mappedIDProvider !== 'code' ? userToken : null,
      inviteCode: mappedIDProvider === 'code' ? userToken : null,
      identityProviderType: mappedIDProvider !== 'code' ? mappedIDProvider : null,
      targetObjectId: inviteState.targetObjectId.value,
      invitee: mappedIDProvider !== 'code' ? userToken : null
    }

    InviteService.sendInvite(sendData)
    handleCloseModal()
    setUserToken('')
  }

  return (
    <React.Fragment>
      <div className={`${classes.dFlex} ${classes.FlexWrap} ${classes.alignCenter} ${classes.mx0}`}>
        <a
          href="#"
          onClick={() => setType('email')}
          className={`${type === 'email' ? classes.bgPrimary : darkMode ? classes.border : classes.borderLight} ${
            classes.roundedCircle
          } ${classes.mx0}`}
        >
          <span>Email</span>
        </a>
        <a
          href="#"
          onClick={() => setType('phone')}
          className={`${type === 'phone' ? classes.bgPrimary : darkMode ? classes.border : classes.borderLight} ${
            classes.roundedCircle
          } ${classes.mx0}`}
        >
          <span>Phone</span>
        </a>
        <a
          href="#"
          onClick={() => setType('code')}
          className={`${type === 'code' ? classes.bgPrimary : darkMode ? classes.border : classes.borderLight} ${
            classes.roundedCircle
          } ${classes.mx0}`}
        >
          <span>Invite Code</span>
        </a>
        <a
          href="#"
          onClick={() => setType('friends')}
          className={`${type === 'friends' ? classes.bgPrimary : darkMode ? classes.border : classes.borderLight} ${
            classes.roundedCircle
          } ${classes.mx0}`}
        >
          <span>Friends</span>
        </a>
      </div>
      <div className={classes.p5}>
        <form>
          <div className="form-group">
            <label htmlFor="" className={classes.mx2}>
              <p>Group:</p>
            </label>
            <FormControl fullWidth>
              <Select
                labelId="invite-group-select-label"
                id="invite-group-select"
                className={!darkMode ? classes.selectLigth : classes.select}
                value={group}
                onChange={(e) => setGroup(e.target.value)}
                MenuProps={{ classes: { paper: darkMode ? classes.selectPaper : classes.selectPaperLight } }}
              >
                <MenuItem value="1" disabled>
                  <em>Select group</em>
                </MenuItem>
                {invitableGroups.value.map((group) => {
                  return (
                    <MenuItem key={group.id} value={group.id}>
                      {group.description}
                    </MenuItem>
                  )
                })}
              </Select>
            </FormControl>{' '}
            {/* <select className={classes.formControls}>
              <option value={inviteState.targetObjectId.value}>{inviteState.targetObjectId.value}</option>
            </select> */}
          </div>
          {type === 'email' ? (
            <div className="form-group">
              <label htmlFor="" className={classes.mx2}>
                <p>Email:</p>
              </label>
              <input
                type="text"
                className={darkMode ? classes.formControls : classes.formControlsLight}
                placeholder="Your@domain.com"
              />
            </div>
          ) : type === 'phone' ? (
            <div className="form-group">
              <label htmlFor="" className={classes.mx2}>
                <p>Phone:</p>
              </label>
              <input
                type="text"
                className={darkMode ? classes.formControls : classes.formControlsLight}
                placeholder="078XXXXXXX"
              />
            </div>
          ) : type === 'code' ? (
            <div className="form-group">
              <label htmlFor="" className={classes.mx2}>
                <p>Code:</p>
              </label>
              <input
                onChange={(e) => handleUserTokenChange(e)}
                type="text"
                className={darkMode ? classes.formControls : classes.formControlsLight}
                placeholder="XXXXXX"
              />
            </div>
          ) : (
            <div className="form-group">
              <label htmlFor="" className={classes.mx2}>
                <p>Friends:</p>
              </label>
              <select className={darkMode ? classes.formControls : classes.formControlsLight}>
                <option value="1">Test Friend 1</option>
                <option value="2">Test Friend 2</option>
                <option value="3">Test Friend 3</option>
              </select>
            </div>
          )}
          <div className={`${classes.dFlex} ${classes.my2}`} style={{ width: '100%' }}>
            <button
              onClick={packageInvite}
              className={`${classes.selfEnd} ${classes.roundedCircle} ${classes.borderNone} ${classes.mx2} ${classes.bgPrimary} ${classes.cpointer} ${classes.hover}`}
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </React.Fragment>
  )
}

export default Group
