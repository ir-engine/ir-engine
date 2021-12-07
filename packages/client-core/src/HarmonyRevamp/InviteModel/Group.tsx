import React, { useState, useContext } from 'react'
import { InviteService, useInviteState } from '@xrengine/client-core/src/social/services/InviteService'
import { useGroupState } from '@xrengine/client-core/src/social/services/GroupService'
import ModeContext from '../context/modeContext'
import { useHarmonyStyles } from '../style'
import { FormControl, MenuItem, Select } from '@mui/material'
import { useFriendState } from '@xrengine/client-core/src/social/services/FriendService'

interface Props {
  handleCloseModal: any
}

const Group = (props: Props) => {
  const { handleCloseModal } = props
  const { darkMode } = useContext(ModeContext)
  const classes = useHarmonyStyles()
  const [type, setType] = React.useState('email')
  const inviteState = useInviteState()
  const [userToken, setUserToken] = useState('')
  const [group, setGroup] = useState(inviteState.targetObjectId.value || '1')
  const groupState = useGroupState()
  const invitableGroupState = groupState.invitableGroups
  const invitableGroups = invitableGroupState.groups

  const identityProviderTabMap = new Map()
  identityProviderTabMap.set(0, 'email')
  identityProviderTabMap.set(1, 'sms')

  //friend state
  const friendState = useFriendState()
  const friendSubState = friendState.friends
  const friends = friendSubState.friends.value

  const handleUserTokenChange = (event: any): void => {
    setUserToken(event.target.value)
  }

  const handleInviteGroupChange = (event: React.ChangeEvent<{ value: string }>): void => {
    setGroup(event.target.value)
    InviteService.updateInviteTarget('group', event.target.value)
  }

  const packageInvite = async (event: any): Promise<void> => {
    const mappedIDProvider = type
    event.preventDefault()
    const sendData = {
      type: 'group',
      token: mappedIDProvider == 'email' || mappedIDProvider == 'sms' ? userToken : null,
      inviteCode: mappedIDProvider === 'code' ? userToken : null,
      identityProviderType: mappedIDProvider == 'email' || mappedIDProvider == 'sms' ? mappedIDProvider : null,
      targetObjectId: inviteState.targetObjectId.value,
      invitee: mappedIDProvider === 'friends' ? userToken : null
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
          onClick={() => setType('sms')}
          className={`${type === 'sms' ? classes.bgPrimary : darkMode ? classes.border : classes.borderLight} ${
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
                onChange={(e) => handleInviteGroupChange(e)}
                MenuProps={{ classes: { paper: darkMode ? classes.selectPaper : classes.selectPaperLight } }}
              >
                <MenuItem value="1" disabled>
                  <em>Select group</em>
                </MenuItem>
                {invitableGroups?.value.map((group) => {
                  return (
                    <MenuItem key={group.id} value={group.id}>
                      {group.name}
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
                onChange={handleUserTokenChange}
                value={userToken}
                className={darkMode ? classes.formControls : classes.formControlsLight}
                placeholder="Your@domain.com"
              />
            </div>
          ) : type === 'sms' ? (
            <div className="form-group">
              <label htmlFor="" className={classes.mx2}>
                <p>Phone:</p>
              </label>
              <input
                type="text"
                onChange={handleUserTokenChange}
                value={userToken}
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
                onChange={handleUserTokenChange}
                value={userToken}
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
              <FormControl fullWidth>
                <Select
                  labelId="invite-group-select-friend-label"
                  id="invite-group-friend-select"
                  className={!darkMode ? classes.selectLigth : classes.select}
                  value={userToken}
                  onChange={(e) => handleUserTokenChange(e)}
                  MenuProps={{ classes: { paper: darkMode ? classes.selectPaper : classes.selectPaperLight } }}
                >
                  <MenuItem value="1" disabled>
                    <em>Select friend</em>
                  </MenuItem>
                  {friends &&
                    [...friends]
                      .sort((a, b) => a.name - b.name)
                      .map((friend, index) => {
                        return (
                          <MenuItem key={friend.id} value={friend.id}>
                            {friend.name}
                          </MenuItem>
                        )
                      })}
                </Select>
              </FormControl>{' '}
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
