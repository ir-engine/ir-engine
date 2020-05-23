
import React, { useEffect, useState } from 'react'

import { useSelector } from 'react-redux'
import { selectInVrModeState } from '../../../redux/app/selector'

// @ts-ignore
import { Entity } from 'aframe-react'

const PlayerComp = () => {
  const inVrMode = useSelector(state => selectInVrModeState(state))

  const [fuse, setFuse] = useState(false)

  useEffect(() => {
    setFuse(inVrMode)
  }, [inVrMode])
  return (
    <Entity
      primitive='a-player'
      fuse-enabled={fuse}
    />
  )
}

export default PlayerComp
