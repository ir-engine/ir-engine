import React, { useEffect } from 'react'
import { initializeEngine } from "@xr3ngine/engine/src/initialize"

export const EnginePage = (): any => {
  useEffect(() => {
    console.log(initializeEngine())
  },[])
  return (
<h1> Engine loaded. </h1>
  )
}

export default EnginePage
