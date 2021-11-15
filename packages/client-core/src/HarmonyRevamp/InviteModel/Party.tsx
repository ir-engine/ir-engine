import React from 'react'
import { useHarmonyStyles } from '../style'

const Party = () => {
  const classes = useHarmonyStyles()
  const [type, setType] = React.useState('email')

  return (
    <>
      <div className={`${classes.dFlex} ${classes.flexWrap} ${classes.alignCenter} ${classes.mx2}`}>
        <a
          href="#"
          onClick={() => setType('email')}
          className={`${type === 'email' ? classes.bgPrimary : classes.border} ${classes.roundedCircle} ${classes.mx2}`}
        >
          <span>Email</span>
        </a>
        <a
          href="#"
          onClick={() => setType('phone')}
          className={`${type === 'phone' ? classes.bgPrimary : classes.border} ${classes.roundedCircle} ${classes.mx2}`}
        >
          <span>Phone</span>
        </a>
        <a
          href="#"
          onClick={() => setType('code')}
          className={`${type === 'code' ? classes.bgPrimary : classes.border} ${classes.roundedCircle} ${classes.mx2}`}
        >
          <span>Invite Code</span>
        </a>
        <a
          href="#"
          onClick={() => setType('friends')}
          className={`${type === 'friends' ? classes.bgPrimary : classes.border} ${classes.roundedCircle} ${
            classes.mx2
          }`}
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
              <input type="text" className={classes.formControls} placeholder="Your@domain.com" />
            </div>
          ) : type === 'phone' ? (
            <div className="form-group">
              <label htmlFor="">
                <p>Phone:</p>
              </label>
              <input type="text" className={classes.formControls} placeholder="078XXXXXXX" />
            </div>
          ) : (
            <div className="form-group">
              <label htmlFor="">
                <p>Code:</p>
              </label>
              <input type="text" className={classes.formControls} placeholder="XXXXXX" />
            </div>
          )}
          <div className={`${classes.dFlex} ${classes.my2}`} style={{ width: '100%' }}>
            <button
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
