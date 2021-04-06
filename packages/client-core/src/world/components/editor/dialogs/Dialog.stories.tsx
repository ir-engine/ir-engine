import React from "react";
import Dialog from "./Dialog";

/**
 * declairing props used for Dialog component
 */
export default {
  title: "Dialog",
  component: Dialog
};

/**
 * [dialog used to render dialog view]
 */
export const dialog = () => <Dialog title="Hello Dialog">Hello World</Dialog>;
