// @ts-nocheck
import React, { Component } from "react";
import PropTypes from "prop-types";
import InputGroup from "../inputs/InputGroup";
import StringInput from "../inputs/StringInput";
import styled from "styled-components";

/**
 * [creating styled component using InputGroup component]
 * @type {Styled Component}
 */
const StyledNameInputGroup = (styled as any)(InputGroup)`
  label {
    width: auto !important;
    padding-right: 8px;
  }
`;

/**
 * [NameInputGroup is used to render input group PropertiesPanelContainer]
 * @type {class component}
 */
export default class NameInputGroup extends Component {

  //declairing propTypes for NameInputGroup
  static propTypes = {
    editor: PropTypes.object.isRequired,
    node: PropTypes.object.isRequired
  };

  // updating state and properties
  constructor(props) {
    super(props);

    this.state = {
      name: ((this.props as any).node as any).name,
      focusedNode: null
    };
  }

 //function to handle change in name property
  onUpdateName = name => {
    this.setState({ name });
  };

 //function called when element get focused
 //Updating state of component
  onFocus = () => {
    this.setState({
      focusedNode: (this.props as any).node,
      name: ((this.props as any).node as any).name
    });
  };

 //function to handle onBlur event on name property
  onBlurName = () => {
    // Check that the focused node is current node before setting the property.
    // This can happen when clicking on another node in the HierarchyPanel
    if (((this.props as any).node as any).name !== (this.state as any).name && (this.props as any).node === (this.state as any).focusedNode) {
      ((this.props as any).editor as any).setPropertySelected("name", (this.state as any).name);
    }

    this.setState({ focusedNode: null });
  };

 //function to handle keyUp event on name property
  onKeyUpName = e => {
    if (e.key === "Enter") {
      e.preventDefault();
      ((this.props as any).editor as any).setPropertySelected("name", (this.state as any).name);
    }
  };

 //rendering view NameInputGroup component
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
