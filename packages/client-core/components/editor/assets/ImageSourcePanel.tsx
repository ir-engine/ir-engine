import React from "react";
import PropTypes from "prop-types";
import MediaSourcePanel from "./MediaSourcePanel";

/**
 * [ImageSourcePanel used to render source container]
 * @param       {any} props
 * @constructor
 */
export default function ImageSourcePanel(props) {
  return <MediaSourcePanel {...props} searchPlaceholder={props.source.searchPlaceholder || "Search images..."} />;
}

// declairing propTypes for ImageSourcePanel
ImageSourcePanel.propTypes = {
  source: PropTypes.object
};
