import React from "react";
import PropTypes from "prop-types";
import Dialog from "./Dialog";

/**
 * [SupportDialog used to render content for support]
 * @param       {function} onCancel
 * @param       {any} props
 * @constructor
 */
export default function SupportDialog({ onCancel, ...props }) {

  //returning view for SupportDialog
  return (
    <Dialog {...props} title="Support">
      <div>
        <p>Need to report a problem?</p>
        <p>
          You can file a{" "}
          <a href="https://github.com/xr3ngine/xr3ngine/issues/new" target="_blank" rel="noopener noreferrer">
            GitHub Issue
          </a>{" "}
          or e-mail us for support at <a href="mailto:support@xr3ngine.dev">support@xr3ngine.dev</a>
        </p>
        <p>
          You can also find us on{" "}
          <a href="https://discord.gg/mQ3D4FE" target="_blank" rel="noopener noreferrer">
            Discord
          </a>
        </p>
      </div>
    </Dialog>
  );
}

/**
 * [declairing propTypes for SupportDialog]
 * @type {Object}
 */
SupportDialog.propTypes = {
  onCancel: PropTypes.func
};
