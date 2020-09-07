// @ts-nocheck
import React, { Component } from "react";
import PropTypes from "prop-types";
import InputGroup from "../inputs/InputGroup";
import StringInput from "../inputs/StringInput";
import styled from "styled-components";

const StyledNameInputGroup = (styled as any)(InputGroup)`
  label {
    width: auto !important;
    padding-right: 8px;
  }
`;

export default class NameInputGroup extends Component {
  static propTypes = {
    editor: PropTypes.object.isRequired,
    node: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      name: ((this.props as any).node as any).name,
      focusedNode: null
    };
  }

  onUpdateName = name => {
    this.setState({ name });
  };

  onFocus = () => {
    this.setState({
      focusedNode: (this.props as any).node,
      name: ((this.props as any).node as any).name
    });
  };

  onBlurName = () => {
    // Check that the focused node is current node before setting the property.
    // This can happen when clicking on another node in the HierarchyPanel
    if (((this.props as any).node as any).name !== (this.state as any).name && (this.props as any).node === (this.state as any).focusedNode) {
      ((this.props as any).editor as any).setPropertySelected("name", (this.state as any).name);
    }

    this.setState({ focusedNode: null });
  };

  onKeyUpName = e => {
    if (e.key === "Enter") {
      e.preventDefault();
      ((this.props as any).editor as any).setPropertySelected("name", (this.state as any).name);
    }
  };

  render() {
    const name = (this.state as any).focusedNode ? (this.state as any).name : ((this.props as any).node as any).name;

    return (
      <StyledNameInputGroup name="Name">
        <StringInput
          /* @ts-ignore */
          value={name}
          onChange={this.onUpdateName}
          onFocus={this.onFocus}
          onBlur={this.onBlurName}
          onKeyUp={this.onKeyUpName}
        />
      </StyledNameInputGroup>
    );
  }
}
