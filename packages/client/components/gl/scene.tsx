import React, { useEffect } from 'react'
import { initializeEngine } from "@xr3ngine/engine/src/initialize"
import { PlayerController } from "../gl_examples/PlayerController"
import { createPrefab } from '@xr3ngine/engine/src/common/functions/createPrefab'

import { car } from "../gl_examples/Car"

export const EnginePage = (): any => {
  useEffect(() => {
    initializeEngine()

    createPrefab(PlayerController)

    createPrefab(car) 

  },[])
  return (
<h1> Engine loaded. </h1>
  )
}

export default EnginePage
