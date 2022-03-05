import React, { useEffect } from 'react'
import { Prompt } from 'react-router-dom'

type BrowserPromptProps = {
  message: ((...args: any[]) => any) | string
}
/**
 *
 * @author Robert Long
 */
export const BrowserPrompt = (props: BrowserPromptProps) => {
  const onBeforeUnload = (e) => {
    const dialogText = props.message
    e.returnValue = dialogText
    return dialogText
  }

  useEffect(() => {
    window.addEventListener('beforeunload', onBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload)
    }
  }, [])

  return <Prompt {...props} />
}

export default BrowserPrompt
