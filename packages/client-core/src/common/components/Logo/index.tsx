import React from 'react'
import { Config } from '@standardcreative/common/src/config'

interface Props {
  onClick: any
}

const Logo = (props: Props): any => {
  return (
    <div className="logo">
      <img
        src={Config.publicRuntimeConfig.logo}
        alt="logo"
        crossOrigin="anonymous"
        className="logo"
        onClick={props.onClick ?? null}
      />
    </div>
  )
}

export default Logo
