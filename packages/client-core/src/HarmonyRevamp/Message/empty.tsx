import * as React from 'react'
import { useHarmonyStyles } from '../style'
import image from '../../../../client/public/static/undraw_empty_re_opql.svg'

const Empty = () => {
  const classes = useHarmonyStyles()

  return (
    <div className={`${classes.dFlex} ${classes.alignCenter} ${classes.justifyCenter} ${classes.h100}`}>
      <img style={{ maxWidth: '60%' }} src={image} alt="" />
    </div>
  )
}

export default Empty
