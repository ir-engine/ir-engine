import React, { useState, useContext } from 'react'
import { InviteService, useInviteState } from '@xrengine/client-core/src/social/services/InviteService'
import ModeContext from '../context/modeContext'
import { useHarmonyStyles } from '../style'
import { FormControl, MenuItem, Select } from '@mui/material'
import { useFriendState } from '@xrengine/client-core/src/social/services/FriendService'

interface Props {
  handleCloseModal: any
}

const Party = (props: Props) => {
  const { handleCloseModal } = props
  const { darkMode } = useContext(ModeContext)
  const classes = useHarmonyStyles()
  const inviteState = useInviteState()
  const [userToken, setUserToken] = useState('')
  const [type, setType] = React.useState('email')

  //friend state
  const friendState = useFriendState()
  const friendSubState = friendState.friends
  const friends = friendSubState.friends.value

  const handleUserTokenChange = (event: any): void => {
    setUserToken(event.target.value)
  }

  const packageInvite = async (event: any): Promise<void> => {
    const mappedIDProvider = type
    event.preventDefault()
    const sendData = {
      type: 'party',
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
    <>
      <div className={`${classes.dFlex} ${classes.flexWrap} ${classes.alignCenter} ${classes.mx2}`}>
        <a
          href="#"
          onClick={() => {
            setType('email')
            setUserToken('')
          }}
          className={`${type === 'email' ? classes.bgPrimary : darkMode ? classes.border : classes.borderLight} ${
            classes.roundedCircle
          } ${classes.mx2}`}
        >
          <span>Email</span>
        </a>
        <a
          href="#"
          onClick={() => {
            setType('sms')
            setUserToken('')
          }}
          className={`${type === 'sms' ? classes.bgPrimary : darkMode ? classes.border : classes.borderLight} ${
            classes.roundedCircle
          } ${classes.mx2}`}
        >
          <span>Phone</span>
        </a>
        <a
          href="#"
          onClick={() => {
            setType('code')
            setUserToken('')
          }}
          className={`${type === 'code' ? classes.bgPrimary : darkMode ? classes.border : classes.borderLight} ${
            classes.roundedCircle
          } ${classes.mx2}`}
        >
          <span>Invite Code</span>
        </a>
        <a
          href="#"
          onClick={() => {
            setType('friends')
            setUserToken('')
          }}
          className={`${type === 'friends' ? classes.bgPrimary : darkMode ? classes.border : classes.borderLight} ${
            classes.roundedCircle
          } ${classes.mx2}`}
        >
          <span>Friends</span>
        </a>
      </div>

      <div className={classes.p5}>
        <form>
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
                <p>Friend:</p>
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
    </>
  )
}

export default Party
