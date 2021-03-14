import React from "react";
import PropTypes from "prop-types";
import MediaSourcePanel from "./MediaSourcePanel";

/**
 * [ModelSourcePanel used to render view containg AssetPanelToolbarContent and AssetPanelContentContainer]
 * @param       {any} props
 * @constructor
 */
export default function ModelSourcePanel(props) {
  return <MediaSourcePanel {...props} searchPlaceholder={props.source.searchPlaceholder || "Search models..."} />;
}

//declairing properties ModelSourcePanel
ModelSourcePanel.propTypes = {
  source: PropTypes.object
};
