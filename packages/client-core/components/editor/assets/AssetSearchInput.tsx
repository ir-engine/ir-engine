import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import inputMixin from "../inputs/inputMixin";

/**
 * [SearchInputContainer used as container element for search input]
 * @type {Styled component}
 */
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

/**
 * [LegalContainer used as privacy Policy link container]
 * @type {Styled component}
 */
const LegalContainer = (styled as any).div`
  display: flex;
  white-space: nowrap;
  text-indent: 0.5em;
`;

/**
 * [AssetSearchInput description]
 * @param       {string} legal            [used to check that we need to show privacy Policy link or not]
 * @param       {string} privacyPolicyUrl [url contains link to privacy Policy page]
 * @param       {function} onChange         [callback function when there is any change in search input]
 * @param       {any} rest
 * @constructor
 */
export default function AssetSearchInput({ legal, privacyPolicyUrl, onChange, ...rest }) {
  return (
    <SearchInputContainer>
      <input placeholder="Search..." onChange={onChange} {...rest} />
      {legal && (
        <LegalContainer>
          {legal}
          {privacyPolicyUrl && (
            <>
              <span>|</span>
              <a rel="noopener noreferrer" target="_blank" href={privacyPolicyUrl}>
                Privacy Policy
              </a>
            </>
          )}
        </LegalContainer>
      )}
    </SearchInputContainer>
  );
}

/**
 * [declairing propTypes for AssetSearchInput]
 * @type {Object}
 */
AssetSearchInput.propTypes = {
  onChange: PropTypes.func,
  legal: PropTypes.string,
  privacyPolicyUrl: PropTypes.string
};
