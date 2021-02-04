import React from "react";
import PropTypes from "prop-types";
import { ContextMenuTrigger } from "../layout/ContextMenu";

/**
 * StylableContextMenuTrigger component used as wrapper for ContextMenu
 * @constructor
 */
export default function StylableContextMenuTrigger({ className, attributes, children, ...rest }) {
  return (
    /* @ts-ignore */
    <ContextMenuTrigger {...rest} attributes={{ className, ...attributes }}>
      {children}
    </ContextMenuTrigger>
  );
}
/** StylableContextMenuTrigger props type Defination */
StylableContextMenuTrigger.propTypes = {
  className: PropTypes.string,
  attributes: PropTypes.object,
  children: PropTypes.node
};
