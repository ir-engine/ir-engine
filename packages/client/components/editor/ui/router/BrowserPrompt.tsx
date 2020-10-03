import React from "react";
import { Prompt } from "react-router-dom";
type BrowserPromptProps = {
  message: ((...args: any[]) => any) | string;
};
export default class BrowserPrompt extends React.Component<
  BrowserPromptProps,
  {}
> {
  constructor(props) {
    super(props);
    window.addEventListener("beforeunload", this.onBeforeUnload);
  }
  componentWillUnmount() {
    window.removeEventListener("beforeunload", this.onBeforeUnload);
  }
  onBeforeUnload = e => {
    const dialogText = this.props.message;
    e.returnValue = dialogText;
    return dialogText;
  };
  render() {
    return <Prompt {...this.props} />;
  }
}
