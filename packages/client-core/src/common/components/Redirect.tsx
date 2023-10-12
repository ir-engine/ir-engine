import React, { useEffect } from 'react'
import { RouterState } from '../services/RouterService'

export const Redirect = (props: { to: string }) => {
  useEffect(() => {
    RouterState.navigate(props.to)
  })
  return <></>
}
