// @ts-ignore
import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

const BlockFormField = (styled as any).div`
  margin-bottom: 16px;

  label {
    display: block;
    margin-bottom: 8px;
  }
`;

const InlineFormField = (styled as any).div`
  display: flex;
  justify-content: space-between;

  & > * {
    margin-left: 30px;
    align-self: center;
  }

  & > :first-child {
    margin-left: 0;
  }
`;

export default function FormField({ inline, children, ...rest }) {
  if (inline) {
    return <InlineFormField {...rest}>{children}</InlineFormField>;
  }

  return <BlockFormField {...rest}>{children}</BlockFormField>;
}

FormField.propTypes = {
  inline: PropTypes.bool,
  children: PropTypes.node
};
