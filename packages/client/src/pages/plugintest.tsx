import { Plugins, registerWebPlugin } from '@capacitor/core'
import React, { useEffect, useState } from 'react'
import { XRPluginPlugin } from 'webxr-native'
import 'webxr-native'

export const IndexPage = (): any => {
  const [initializationResponse, setInitializationResponse] = useState('')
  const [secondState, setSecondState] = useState('')

  useEffect(() => {
    async function doTest() {
      const { XRPlugin } = Plugins
      registerWebPlugin(XRPlugin as any)
      ;(XRPlugin as XRPluginPlugin).initialize({}).then((response) => {
        setInitializationResponse(response.status)
      })
    }
    doTest()
  }, [])

  useEffect(() => {
    setSecondState('Initialized and effected')
  }, [initializationResponse])

  return (
    <div className="plugintest">
      <div className="plugintestReadout">
        <p>{initializationResponse}</p>
        <p>{secondState}</p>
      </div>
    </div>
  )
}

export default IndexPage
