import React, { useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { App, URLOpenListenerEvent } from '@capacitor/app'

const AppUrlListener: React.FC<any> = () => {
  let history = useHistory()
  useEffect(() => {
    App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
      // url: https://dev.arcmedia.us/login
      // slug = /login
      const slug = event.url.split('.us').pop()
      if (slug) {
        history.push(slug)
      }
      // If no match, do nothing - let regular routing
      // logic take over
    })
  }, [])

  return null
}

export default AppUrlListener
