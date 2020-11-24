import { Component } from "react";
import { createPortal } from "react-dom";
export default class Portal extends Component<{}, {}> {
  constructor(props) {
    super(props);
    this.el = document.createElement("div");
  }
  componentDidMount() {
    document.body.appendChild(this.el);
  }
  componentWillUnmount() {
    try {
      if (this.el) {
        document.body.removeChild(this.el);
      }
    } catch (err) {
      console.warn(`Error removing Portal element: ${err}`);
    }
  }
  el: HTMLDivElement;
  render() {
    return createPortal(this.props.children, this.el);
  }
}
