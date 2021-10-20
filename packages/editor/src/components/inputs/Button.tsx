import styled from 'styled-components'

/**
 * Button used to provide styles to button input.
 *
 * @author Robert Long
 * @type {Styled component}
 */
export const Button = styled.button.attrs((props) => ({
  type: props.type || 'button'
}))`
  display: flex;
  border: none;
  border-radius: 4px;
  background: ${(props) => props.theme.blue};
  color: ${(props) => props.theme.white};
  white-space: nowrap;
  min-height: 24px;
  font-size: 15px;
  font-family: 'Lato', sans-serif;
  text-align: center;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  padding: 1px 6px;
  width: 150px;
  margin-right: 15px;

  &:hover {
    color: ${(props) => props.theme.text};
    background-color: ${(props) => props.theme.bluePressed};
  }

  &:active {
    color: ${(props) => props.theme.text};
    background-color: ${(props) => props.theme.bluePressed};
  }

  &:disabled {
    background: ${(props) => props.theme.disabled};
    color: ${(props) => props.theme.disabledText};

    &:hover {
      background-color: ${(props) => props.theme.disabled};
    }
  }
`

/**
 * MediumButton used to create medium size button.
 *
 * @author Robert Long
 * @type {styled component}
 */
export const MediumButton = styled(Button)`
  line-height: 1em;
  height: 3em;
  padding: 1em;
`

/**
 * LargeButton used to create large size button.
 *
 * @author Robert Long
 * @type {Styled component}
 */
export const LargeButton = styled(Button)`
  min-height: 24px;
  padding: 1em 2em;
  font-size: 1.5em;
`

/**
 * SecondaryButton is the button used for performing secondary action like cancel.
 *
 * @author Robert Long
 * @type {Styled component}
 */
export const SecondaryButton = styled(Button)`
  background-color: ${(props) => props.theme.hover};
  color: ${(props) => props.theme.text};

  &:hover {
    background-color: ${(props) => props.theme.text2};
  }

  &:active {
    background-color: ${(props) => props.theme.text2};
  }

  &:disabled {
    background-color: ${(props) => props.theme.disabled};
    color: ${(props) => props.theme.disabledText};

    &:hover {
      background-color: transparent;
    }
  }
`

/**
 * MenuButton used to show menus like context menus.
 *
 * @author Robert Long
 * @type {styled component}
 */
export const MenuButton = styled(Button)`
  background-color: transparent;
  color: ${(props) => props.theme.text2};
  padding: 1px 8px;

  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }

  &:active {
    background-color: rgba(255, 255, 255, 0.2);
  }

  &:disabled {
    background-color: transparent;
    color: ${(props) => props.theme.disabledText};

    &:hover {
      background-color: transparent;
    }
  }
`

/**
 * PropertiesPanelButton used in property penal like in ScenePreviewCamera nodes we using it as set from viewport.
 *
 * @author Robert Long
 * @type {Styled component}
 */
export const PropertiesPanelButton = styled(Button)`
  align-self: center;
  justify-content: center;
  width: 200px;
`
