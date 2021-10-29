import { Prompt } from 'react-router-dom'
import React, { useEffect } from 'react'
type BrowserPromptProps = {
  message: ((...args: any[]) => any) | string
}
/**
 *
 * @author Robert Long
 */
const BrowserPrompt = (props: BrowserPromptProps) => {
  const onBeforeUnload = (e) => {
    const dialogText = props.message
    e.returnValue = dialogText
    return dialogText
  }

  useEffect(() => {
    window.addEventListener('beforeunload', onBeforeUnload)
  }, [])

  useEffect(() => {
    window.removeEventListener('beforeunload', onBeforeUnload)
  }, null)

  return <Prompt {...props} />
}

export default BrowserPrompt
