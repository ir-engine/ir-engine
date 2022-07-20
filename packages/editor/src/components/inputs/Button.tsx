import styled from 'styled-components'

/**
 * Button used to provide styles to button input.
 *
 * @type {Styled component}
 */
export const Button = styled.button.attrs((props) => ({
  type: props.type || 'button'
}))`
  display: flex;
  border: none;
  border-radius: 4px;
  background: var(--buttonFilled);
  color: var(--white);
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
    color: var(--textColor);
    opacity: 0.8;
  }

  &:active {
    color: var(--textColor);
  }

  &:disabled {
    background: var(--disabled);
    color: var(--disabledText);

    &:hover {
      background-color: var(--disabled);
    }
  }
`

/**
 * MediumButton used to create medium size button.
 *
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
 * @type {Styled component}
 */
export const SecondaryButton = styled(Button)`
  background-color: var(--buttonFilled);
  color: var(--textColor);

  &:hover {
    opacity: 0.8;
  }

  &:active {
    opacity: 0.8;
  }

  &:disabled {
    background-color: var(--disabled);
    color: var(--disabledText);

    &:hover {
      background-color: transparent;
    }
  }
`

/**
 * MenuButton used to show menus like context menus.
 *
 * @type {styled component}
 */
export const MenuButton = styled(Button)`
  background-color: buttonFilled;
  color: var(--textColor);
  padding: 1px 8px;
  width: 20px;
  margin-right: 0px;

  &:hover {
    opacity: 0.8;
  }

  &:active {
    opacity: 0.8;
  }

  &:disabled {
    background-color: var(--disabled);
    color: var(--disabledText);

    &:hover {
      background-color: transparent;
    }
  }
`

/**
 * PropertiesPanelButton used in property penal like in ScenePreviewCamera nodes we using it as set from viewport.
 *
 * @type {Styled component}
 */
export const PropertiesPanelButton = styled(Button)`
  align-self: center;
  justify-content: center;
  width: 200px;
`
