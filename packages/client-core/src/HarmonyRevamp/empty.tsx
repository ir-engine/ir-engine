import * as React from 'react'
import { useHarmonyStyles } from './style'
import image from '../../../client/public/static/undraw_Empty_re_opql.png'

const Empty = () => {
  const classes = useHarmonyStyles()

  return (
    <div className={`${classes.dFlex} ${classes.alignCenter} ${classes.justifyCenter} ${classes.h100}`}>
      <img style={{ maxWidth: '60%' }} src={image} alt="" />
      {/* <h1>Empty Box</h1> */}
    </div>
  )
}

export default Empty
