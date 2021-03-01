import React from "react";
import PropTypes from "prop-types";
import MediaSourcePanel from "./MediaSourcePanel";
/**
 * UploadSourcePanel component used to render MediaSourcePanel.
 * @param {any} props
 * @constructor
 */
export default function UploadSourcePanel(props) {
  return <MediaSourcePanel {...props} searchPlaceholder={props.source.searchPlaceholder || "Search assets..."} />;
}

/**
 * declaring propTypes for UploadSourcePanel.
 */
UploadSourcePanel.propTypes = {
  source: PropTypes.object
};
