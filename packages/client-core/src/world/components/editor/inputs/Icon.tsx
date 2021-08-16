import React from 'react'
import PropTypes from 'prop-types'

/**
 * Icon used to render view for icon component.
 *
 * @author Robert Long
 * @param {object} props
 * @constructor
 */
export function Icon(props) {
  return <img src={props.src} style={{ color: props.color, width: props.size, height: props.size }} />
}

/**
 * Declaring propTypes for Component.
 *
 * @author Robert Long
 * @type {Object}
 */
Icon.propTypes = {
  src: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  size: PropTypes.number.isRequired
}

/**
 * assign default properties for component.
 *
 * @author Robert Long
 * @type {Object}
 */
Icon.defaultProps = {
  color: 'white',
  size: 32
}
export default Icon
