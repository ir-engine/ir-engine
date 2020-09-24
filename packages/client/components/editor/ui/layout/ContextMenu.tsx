import React from "react";
import {
  connectMenu as _connectMenu,
  ContextMenu as ReactContextMenu,
  MenuItem as _MenuItem,
  showMenu as _showMenu,
  SubMenu as _SubMenu,
  ContextMenuTrigger as _ContextMenuTrigger
} from "react-contextmenu";
import { createGlobalStyle } from "styled-components";
export const connectMenu = _connectMenu;
export const MenuItem = _MenuItem;
export const showMenu = _showMenu;
export const SubMenu = _SubMenu;
export const ContextMenuTrigger = _ContextMenuTrigger;
// background-color: ${props => (props.theme as any).dropdown};
// box-shadow: ${props => (props.theme as any).shadow30};
// color: ${props => (props.theme as any).text};
// background-color: ${props => (props.theme as any).selected};
// color: ${props => (props.theme as any).text};
// border-bottom: 1px solid ${props => (props.theme as any).theme.border};

export const ContextMenuStyles = createGlobalStyle`
  .react-contextmenu {
    background-clip: padding-box;
    border-radius: 4px;
    margin: 2px 0 0;
    min-width: 140px;
    outline: none;
    opacity: 0;
    padding: 4px 0;
    pointer-events: none;
    text-align: left;
  }

  .react-contextmenu.react-contextmenu--visible {
    opacity: 1;
    pointer-events: auto;
    z-index: 9999;
  }

  .react-contextmenu-item {
    background: 0 0;
    border: 0;
    cursor: pointer;
    line-height: 24px;
    padding: 4px 8px;
    text-align: inherit;
    white-space: nowrap;
    display: flex;
    flex: 1;
    justify-content: space-between;
  }

  .react-contextmenu-item.react-contextmenu-item--active,
  .react-contextmenu-item.react-contextmenu-item--selected {
    border-color: transparent;
    text-decoration: none;
  }

  .react-contextmenu-item.react-contextmenu-item--disabled,
  .react-contextmenu-item.react-contextmenu-item--disabled:hover {
    background-color: transparent;
    border-color: rgba(0,0,0,.15);
  }

  .react-contextmenu-item--divider {
    cursor: inherit;
    margin: 4px 0;
    height: 1px;
    padding: 0;
  }

  .react-contextmenu-item.react-contextmenu-submenu {
    padding: 0;
  }

  .react-contextmenu-item.react-contextmenu-submenu > .react-contextmenu-item::after {
    display: inline-block;
    font-size: 12px;
    content: "▸";
    vertical-align: middle;
  }
`;
export const ContextMenu: React.SFC<{}> = ({ children, ...rest }) => {
  return (
    <>
      <ReactContextMenu id="ContextMenu" {...rest}>{children}</ReactContextMenu>
      <ContextMenuStyles />
    </>
  );
};
