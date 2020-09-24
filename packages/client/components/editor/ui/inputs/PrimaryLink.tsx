import React from "react"
import styled from "styled-components";

const PrimaryLink = (styled as any).div`
  font-size: 1.2em;
  color: ${props => props.theme.blue};
  line-height: 3em;
  vertical-align: middle;
`;

export default PrimaryLink;
