import React from "react";
import PropTypes from "prop-types";
import MediaSourcePanel from "./MediaSourcePanel";

/**
 * VideoSourcePanel used to render view of MediaSourcePanel.
 * 
 * @author Robert Long
 * @param       {object} props
 * @constructor
 */
export default function VideoSourcePanel(props) {
  return <MediaSourcePanel {...props} searchPlaceholder={props.source.searchPlaceholder || "Search videos..."} />;
}

/**
 * declairing propTypes for VideoSourcePanel.
 * 
 * @author Robert Long
 * @type {Object}
 */
VideoSourcePanel.propTypes = {
  source: PropTypes.object
};
