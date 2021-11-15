import * as React from 'react'
import { useHarmonyStyles } from './style'
import Empty from '../../../client/public/static/undraw_Empty_re_opql.png'

const Empty = () => {
  const classes = useHarmonyStyles()

  return (
    <div className={`${classes.dFlex} ${classes.alignCenter} ${classes.justifyCenter} ${classes.h100}`}>
      <img src={Empty} alt="" />
      <h1>Empty Box</h1>
    </div>
  )
}

export default Empty
