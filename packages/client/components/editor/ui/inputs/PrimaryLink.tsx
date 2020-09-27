import Link from "next/link"
import styled from "styled-components";
import { withTheme } from "../theme";

const PrimaryLink = withTheme(styled.a`
  font-size: 1.2em;
  color: ${props => props.theme.blue};
  line-height: 3em;
  vertical-align: middle;
`);

export default PrimaryLink;
