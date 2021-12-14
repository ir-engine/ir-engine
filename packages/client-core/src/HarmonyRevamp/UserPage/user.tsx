import * as React from 'react'
import { useHarmonyStyles } from '../style'
import User1 from '../../../../client/public/static/User.png'

const UserPage = () => {
  const classes = useHarmonyStyles()

  return (
    <div className={`${classes.p2} ${classes.scroll}`}>
      <a href="#">
        <img src={User1} alt="" className={classes.my4} width={70} height={70} />
      </a>
    </div>
  )
}

export default UserPage
