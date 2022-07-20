import styled from 'styled-components'

/**
 * BorderColor used to return border color.
 *
 * @param  {object} props
 * @param  {string} defaultColor
 */
function borderColor(props, defaultColor) {
  if (props.canDrop) {
    return 'var(--blue)'
  } else if (props.error) {
    return 'var(--error)'
  } else {
    return defaultColor
  }
}

/**
 * Used to provide styles for input field.
 *
 * @type {styled component}
 */
const Input = styled.input`
  background-color: ${(props) => (props.disabled ? 'var(--disabled)' : 'var(--inputBackground)')};
  border-radius: 4px;
  border: 1px solid ${(props) => borderColor(props, 'var(--inputOutline)')};
  color: ${(props) => (props.disabled ? 'var(--disabledText)' : 'var(--textColor)')};
  height: 24px;
  padding: 6px 8px;

  &:hover {
    border-color: 'var(--blueHover)';
  }

  &:focus {
    border-color: 'var(--blue)';
  }

  &:disabled {
    background-color: 'var(--disabled)';
    color: 'var(--disabledText)';
  }

  &:focus-visible {
    outline: none;
  }
`
/**
 * Used to render component view.
 */
export default Input
