import React, { useEffect } from 'react'
import { initializeEngine } from "@xr3ngine/engine"

export const EnginePage = (): any => {
  useEffect(() => {
    initializeEngine()
  })
  return (<>
<h1> Hey </h1>
  </>
  )
}

export default EnginePage
