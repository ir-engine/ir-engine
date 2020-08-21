import React from "react";
import PropTypes from 'prop-types';

const Icon = ({ src, color, size }) => (
  <svg className={`icon icon-${name}`} fill={color} width={size} height={size}>
    <use xlinkHref={`${src}`} />
  </svg>
);

Icon.propTypes = {
  src: PropTypes.string.isRequired,
  color: PropTypes.string,
  size: PropTypes.number
};

export default Icon;