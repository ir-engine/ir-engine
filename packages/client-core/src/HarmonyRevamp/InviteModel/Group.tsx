import React from 'react'
import { useHarmonyStyles } from '../style'

const Group = () => {
  const classes = useHarmonyStyles()
  const [type, setType] = React.useState('email')
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
          onClick={() => setType('phone')}
          className={`${type === 'phone' ? classes.bgPrimary : classes.border} ${classes.roundedCircle} ${classes.mx0}`}
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
            <select className={classes.formControls}>
              <option value="1">Test Group</option>
            </select>
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
              <input type="text" className={classes.formControls} placeholder="XXXXXX" />
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
