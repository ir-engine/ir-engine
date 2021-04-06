import React from "react";
import PropTypes from "prop-types";

/**
 * [Icon used to render view for icon component]
 * @param {object} props
 * @constructor
 */
export default function Icon(props) {
  return <img src={props.src} style={{ color: props.color, width: props.size, height: props.size }} />;
}

/**
 * [declaring propTypes for Component]
 * @type {Object}
 */
Icon.propTypes = {
  src: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  size: PropTypes.number.isRequired
};

/**
 * [assign default properties for component]
 * @type {Object}
 */
Icon.defaultProps = {
  color: "white",
  size: 32
};
