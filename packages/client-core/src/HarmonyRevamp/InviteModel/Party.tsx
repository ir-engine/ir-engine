import React, { useState, useContext } from 'react'
import { InviteService, useInviteState } from '@xrengine/client-core/src/social/services/InviteService'
import ModeContext from '../context/modeContext'
import { useHarmonyStyles } from '../style'

const Party = () => {
  const { darkMode } = useContext(ModeContext)
  const classes = useHarmonyStyles()
  const inviteState = useInviteState()
  const [userToken, setUserToken] = useState('')
  const [type, setType] = React.useState('email')

  const handleUserTokenChange = (event: any): void => {
    console.log(event.target.value, 'zzzzzzzzzzzzzzzzzzzzzzzzztettttee')
    setUserToken(event.target.value)
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
    console.log(sendData)
    setUserToken('')
  }

  return (
    <>
      <div className={`${classes.dFlex} ${classes.flexWrap} ${classes.alignCenter} ${classes.mx2}`}>
        <a
          href="#"
          onClick={() => setType('email')}
          className={`${type === 'email' ? classes.bgPrimary : darkMode ? classes.border : classes.borderLight} ${
            classes.roundedCircle
          } ${classes.mx2}`}
        >
          <span>Email</span>
        </a>
        <a
          href="#"
          onClick={() => setType('phone')}
          className={`${type === 'phone' ? classes.bgPrimary : darkMode ? classes.border : classes.borderLight} ${
            classes.roundedCircle
          } ${classes.mx2}`}
        >
          <span>Phone</span>
        </a>
        <a
          href="#"
          onClick={() => setType('code')}
          className={`${type === 'code' ? classes.bgPrimary : darkMode ? classes.border : classes.borderLight} ${
            classes.roundedCircle
          } ${classes.mx2}`}
        >
          <span>Invite Code</span>
        </a>
        <a
          href="#"
          onClick={() => setType('friends')}
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
                className={darkMode ? classes.formControls : classes.formControlsLight}
                placeholder="Your@domain.com"
              />
            </div>
          ) : type === 'phone' ? (
            <div className="form-group">
              <label htmlFor="">
                <p>Phone:</p>
              </label>
              <input
                type="text"
                className={darkMode ? classes.formControls : classes.formControlsLight}
                placeholder="078XXXXXXX"
              />
            </div>
          ) : (
            <div className="form-group">
              <label htmlFor="">
                <p>Code:</p>
              </label>
              <input
                type="text"
                className={darkMode ? classes.formControls : classes.formControlsLight}
                placeholder="XXXXXX"
              />
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
    </>
  )
}

export default Party
