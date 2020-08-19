import React, { useEffect } from 'react'
import { initializeEngine } from "@xr3ngine/engine/src/initialize"
import { PlayerController } from "./PlayerController"
import { createPrefab } from '@xr3ngine/engine/src/common/functions/createPrefab'

import { car } from "./Car"

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
