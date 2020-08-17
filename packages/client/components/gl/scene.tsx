import React, { useEffect } from 'react'
import { initialize } from "@xr3ngine/engine/src/initialize"

export const EnginePage = (): any => {
  useEffect(() => {
    console.log(initialize())
  },[])
  return (
<h1> Engine loaded. </h1>
  )
}

export default EnginePage
