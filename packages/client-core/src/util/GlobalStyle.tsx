/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { createGlobalStyle } from 'styled-components'

/**
 * GlobalStyle component used to provide common styles all over application.
 *
 * @type {styled component}
 */
const GlobalStyle = createGlobalStyle<{ theme: any }>`
  /*! minireset.css v0.0.4 | MIT License | github.com/jgthms/minireset.css */
  html,
  body,
  p,
  ol,
  ul,
  li,
  dl,
  dt,
  dd,
  blockquote,
  figure,
  fieldset,
  legend,
  textarea,
  pre,
  iframe,
  hr,
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin: 0;
    padding: 0;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    font-size: 100%;
    font-weight: normal;
  }

  ul {
    list-style: none;
  }

  button,
  input,
  select,
  textarea {
    margin: 0;
  }

  html {
    box-sizing: border-box;
  }

  *, *:before, *:after {
    box-sizing: inherit;
  }

  img,
  embed,
  iframe,
  object,
  video {
    height: auto;
    max-width: 100%;
  }

  audio {
    max-width: 100%;
  }

  iframe {
    border: 0;
  }

  table {
    border-collapse: collapse;
    border-spacing: 0;
  }

  td,
  th {
    padding: 0;
    text-align: left;
  }

  /* scrollbar-width is not inherited so apply to all elements. */
  * {
    scrollbar-width: thin;
  }

  ::selection {
    color: var(--textColor);
    background-color: var(--dropdownMenuHoverBackground);
  }

  a {
    color: var(--textColor);

    &:hover {
      color: var(--blueHover);
    }

    &:active {
      color: var(--bluePressed);
    }
  }

  html, body {
    width: 100%;
    height: 100%;
  }

  #app {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  main {
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  body {
    font-family: var(--lato);
    font-size: 12px;
    color: var(--textColor);
    background-color: var(--background);
    scrollbar-color: #282c31 #5d646c;
  }

  .sentry-error-embed {
    .form-field {
      margin-top: 20px;
    }

    .form-field:not(:last-child) {
      display: none;
    }
  }
`
export default GlobalStyle
