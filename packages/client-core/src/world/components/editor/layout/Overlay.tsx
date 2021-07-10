import styled from 'styled-components'

/**
 *
 *  @author Robert Long
 */
const Overlay = (styled as any).div`
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  pointer-events: ${(props) => props.pointerEvents || 'inherit'};
`

export default Overlay
