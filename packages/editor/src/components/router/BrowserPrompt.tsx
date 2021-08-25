import { Prompt } from 'react-router-dom'
import React from 'react'
type BrowserPromptProps = {
  message: ((...args: any[]) => any) | string
}
/**
 *
 * @author Robert Long
 */
export class BrowserPrompt extends React.Component<BrowserPromptProps, {}> {
  constructor(props) {
    super(props)
    window.addEventListener('beforeunload', this.onBeforeUnload)
  }
  componentWillUnmount() {
    window.removeEventListener('beforeunload', this.onBeforeUnload)
  }
  onBeforeUnload = (e) => {
    const dialogText = this.props.message
    e.returnValue = dialogText
    return dialogText
  }
  render() {
    return <Prompt {...this.props} />
  }
}

export default BrowserPrompt
