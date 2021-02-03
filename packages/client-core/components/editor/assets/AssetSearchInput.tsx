import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import inputMixin from "../inputs/inputMixin";

const SearchInputContainer = (styled as any).div`
  display: flex;
  align-items: center;
  flex: 1;
  justify-content: flex-end;

  a {
    color: ${props => props.theme.text};
  }

  input {
    ${inputMixin}
    margin-right: 8px;
    display: flex;
    flex: 1;
    max-width: 300px;
  }
`;

export default function AssetSearchInput({ onChange, ...rest }) {
  return (
    <SearchInputContainer>
      <input placeholder="Search..." onChange={onChange} {...rest} />
    </SearchInputContainer>
  );
}

AssetSearchInput.propTypes = {
  onChange: PropTypes.func
};
