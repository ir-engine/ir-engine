import React from "react";
import PropTypes from "prop-types";
import { UIDialog } from "./Dialog";

export default function SupportDialog({ onCancel, ...props }) {
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
SupportDialog.propTypes = {
  onCancel: PropTypes.func
};
