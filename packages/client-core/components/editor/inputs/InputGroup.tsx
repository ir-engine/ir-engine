import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { QuestionCircle } from "@styled-icons/fa-regular/QuestionCircle";
import { InfoTooltip } from "../layout/Tooltip";
/**
 * [used to provide styles for InputGroupContainer div]
 * @type {Styled component}
 */
export const InputGroupContainer = (styled as any).div`
  display: flex;
  flex-direction: row;
  padding: 4px 8px;
  flex: 1;
  min-height: 24px;

  ${props =>
    props.disabled &&
    `
    pointer-events: none;
    opacity: 0.3;
  `}

  & > label {
    display: block;
    width: 25%;
    color: ${props => props.theme.text2};
    padding-bottom: 2px;
    padding-top: 4px;
  }
`;

/**
 * [used to provide styles for InputGroupContent div]
 * @type {Styled component}
 */
export const InputGroupContent = (styled as any).div`
  display: flex;
  flex-direction: row;
  flex: 1;
  padding-left: 8px;
`;

/**
 * [used to provide styles for InputGroupInfoIcon div]
 * @type {styled component}
 */
export const InputGroupInfoIcon = (styled as any)(QuestionCircle)`
  width: 20px;
  display: flex;
  padding-left: 8px;
  color: ${props => props.theme.blue};
  cursor: pointer;
  align-self: center;
`;
/**
 * [used to render InfoTooltip component]
 * @param  {string} info
 * @constructor
 */
export function InputGroupInfo({ info }) {
  return (
    <InfoTooltip info={info}>
      <InputGroupInfoIcon />
    </InfoTooltip>
  );
}

/**
 * [declaring proptoTtypes for InputGroupInfo Component]
 * @type {Object}
 */
InputGroupInfo.propTypes = {
  info: PropTypes.string
};

/**
 * [InputGroup used to render the view of component]
 * @param       {string} name
 * @param       {any} children
 * @param       {boolean} disabled
 * @param       {string} info
 * @param       {any} rest
 * @constructor
 */
export default function InputGroup({ name, children, disabled, info, ...rest }) {
  return (
    <InputGroupContainer disabled={disabled} {...rest}>
      <label>{name}:</label>
      <InputGroupContent>
        {children}
        {info && <InputGroupInfo info={info} />}
      </InputGroupContent>
    </InputGroupContainer>
  );
}

/**
 * [declaring proptoTtypes for InputGroup Component]
 * @type {Object}
 */
InputGroup.propTypes = {
  name: PropTypes.string,
  children: PropTypes.any,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  info: PropTypes.string
};
