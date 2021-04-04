import React, { useEffect, createContext, useContext } from "react";
import PropTypes from "prop-types";
import useHover from "../hooks/useHover";

const AudioPreviewContext = createContext(new Audio());

/**
 * [AudioPreview cused to provides the options for audio]
 * @param       {String} src
 * @param       {String} children
 * @constructor
 */
export default function AudioPreview({ src, children }) {
  const audio = useContext(AudioPreviewContext);
  const [hoverRef, isHovered] = useHover();

  useEffect(() => {
    if (isHovered) {
      audio.src = src;
      audio.play();
    } else {
      audio.pause();
    }
  }, [isHovered, src, audio]);
  /* @ts-ignore */
  return <div ref={hoverRef}>{children}</div>;
}

/**
 * [declairing propTypes for AudioPreview]
 * @type {Object}
 */
AudioPreview.propTypes = {
  src: PropTypes.string,
  children: PropTypes.node
};
