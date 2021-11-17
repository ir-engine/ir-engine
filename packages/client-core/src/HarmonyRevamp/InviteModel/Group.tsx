import React, { useState } from 'react'
import { InviteService, useInviteState } from '@xrengine/client-core/src/social/services/InviteService'
import { useGroupState } from '@xrengine/client-core/src/social/services/GroupService'
import { useHarmonyStyles } from '../style'
import { MenuItem, Select } from '@mui/material'

const Group = () => {
  const classes = useHarmonyStyles()
  const [type, setType] = React.useState('email')

  const [tabIndex, setTabIndex] = useState(0)
  const [userToken, setUserToken] = useState('')
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
      type: inviteState.targetObjectType.value === 'user' ? 'friend' : inviteState.targetObjectType.value,
      token: mappedIDProvider !== 'code' ? userToken : null,
      inviteCode: mappedIDProvider === 'code' ? userToken : null,
      identityProviderType: mappedIDProvider !== 'code' ? mappedIDProvider : null,
      targetObjectId: inviteState.targetObjectId.value,
      invitee: mappedIDProvider !== 'code' ? userToken : null
    }

    InviteService.sendInvite(sendData)
    //console.log(sendData)
    setUserToken('')
  }
  return (
    <React.Fragment>
      <div className={`${classes.dFlex} ${classes.flexWrap} ${classes.alignCenter} ${classes.mx0}`}>
        <a
          href="#"
          onClick={() => setType('email')}
          className={`${type === 'email' ? classes.bgPrimary : classes.border} ${classes.roundedCircle} ${classes.mx0}`}
        >
          <span>Email</span>
        </a>
        <a
          href="#"
          onClick={() => setType('sms')}
          className={`${type === 'phone' ? classes.bgPrimary : classes.border} ${classes.roundedCircle} ${classes.mx2}`}
        >
          <span>Phone</span>
        </a>
        <a
          href="#"
          onClick={() => setType('code')}
          className={`${type === 'code' ? classes.bgPrimary : classes.border} ${classes.roundedCircle} ${classes.mx0}`}
        >
          <span>Invite Code</span>
        </a>
        <a
          href="#"
          onClick={() => setType('friends')}
          className={`${type === 'friends' ? classes.bgPrimary : classes.border} ${classes.roundedCircle} ${
            classes.mx0
          }`}
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
            <Select
              labelId="invite-group-select-label"
              id="invite-group-select"
              value={inviteState.targetObjectId.value}
              //onChange={handleInviteGroupChange}
              //onScroll={onSelectScroll}
            >
              {invitableGroups.value.map((group) => {
                return (
                  <MenuItem
                    // className={classNames({
                    //   [styles['flex-center']]: true,
                    //   [styles['color-white']]: true
                    // })}
                    key={group.id}
                    value={group.id}
                  >
                    {group.description}
                  </MenuItem>
                )
              })}
            </Select>
            {/* <select className={classes.formControls}>
              <option value={inviteState.targetObjectId.value}>{inviteState.targetObjectId.value}</option>
            </select> */}
          </div>
          {type === 'email' ? (
            <div className="form-group">
              <label htmlFor="" className={classes.mx2}>
                <p>Email:</p>
              </label>
              <input type="text" className={classes.formControls} placeholder="Your@domain.com" />
            </div>
          ) : type === 'phone' ? (
            <div className="form-group">
              <label htmlFor="" className={classes.mx2}>
                <p>Phone:</p>
              </label>
              <input type="text" className={classes.formControls} placeholder="078XXXXXXX" />
            </div>
          ) : type === 'code' ? (
            <div className="form-group">
              <label htmlFor="" className={classes.mx2}>
                <p>Code:</p>
              </label>
              <input
                onChange={(e) => handleUserTokenChange(e)}
                type="text"
                className={classes.formControls}
                placeholder="XXXXXX"
              />
            </div>
          ) : (
            <div className="form-group">
              <label htmlFor="" className={classes.mx2}>
                <p>Friends:</p>
              </label>
              <select className={classes.formControls}>
                <option value="1">Test Friend 1</option>
                <option value="2">Test Friend 2</option>
                <option value="3">Test Friend 3</option>
              </select>
            </div>
          )}
          <div className={`${classes.dFlex} ${classes.my2}`} style={{ width: '100%' }}>
            <button
              onClick={packageInvite}
              className={`${classes.selfEnd} ${classes.roundedCircle} ${classes.borderNone} ${classes.mx2} ${classes.bgPrimary}`}
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
