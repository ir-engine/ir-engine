import { css } from 'styled-components'

/**
 * Styled component containing  common css styles.
 */
export default css`
  background-color: var(--inputBackground);
  border-radius: 4px;
  border: 1px solid var(--inputOutline);
  color: var(--textColor);
  height: 24px;
  padding: 6px 8px;

  &:hover {
    border-color: var(--blueHover);
  }

  &:focus {
    border-color: var(--blue);
  }

  &:disabled {
    background-color: var(--disabled);
    color: var(--disabledText);
  }
`
