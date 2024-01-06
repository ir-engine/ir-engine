/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import React from 'react'

import { ClientThemeOptionsType } from '@etherealengine/common/src/schema.type.module'

interface DemoStyleProps {
  theme: ClientThemeOptionsType
}

const DemoStyle = ({ theme }: DemoStyleProps) => {
  return (
    <style>
      {`
      .themeDemoArea {
        width: 100%;
        height: 500px;
        color: ${theme.textColor};
        background: white;      
        box-shadow: 0px 2px 1px -1px rgb(0 0 0 / 20%), 0px 1px 1px 0px rgb(0 0 0 / 14%), 0px 1px 3px 0px rgb(0 0 0 / 12%);
        position: relative;
      }

      .navbar {
        width: 100%;
        height: 50px;
        padding: 10px;
        position: sticky;
        background-color: ${theme.navbarBackground};
        box-shadow: 0px 2px 4px -1px rgb(0 0 0 / 20%), 0px 4px 5px 0px rgb(0 0 0 / 14%), 0px 1px 10px 0px rgb(0 0 0 / 12%);
      }

      .logoSection {
        color: ${theme.textColor};
      }

      .mainSection {
        display: flex;
        flex-direction: row;
        width: 100%;
        height: calc(100% - 50px);
      }

      .hiddenWidth {
        width: 120%;
        height: 0px;
        visibility: hidden;
      }

      .contentArea {
        flex: 1;
        overflow: auto;
        background: ${theme.mainBackground};
      }

      .contentArea::-webkit-scrollbar-thumb {
        background: linear-gradient(${theme.scrollbarThumbYAxisStart}, ${theme.scrollbarThumbYAxisEnd});
      }
      
      .contentArea::-webkit-scrollbar-thumb:horizontal {
        background: linear-gradient(92.22deg, ${theme.scrollbarThumbXAxisStart}, ${theme.scrollbarThumbXAxisEnd});
      }
      
      .contentArea::-webkit-scrollbar-corner {
        background-color: ${theme.scrollbarCorner};
      }

      .sidebar {
        width: 100px;
        height: 100%;
        background: ${theme.sidebarBackground};
      }

      .sidebarSelectedItem {
        background-color: ${theme.sidebarSelectedBackground} !important;
      }

      .panel {
        display: flex;
        margin: 20px;
        padding: 20px;
        flex-direction: column;
        border-radius: 8px;
        background: ${theme.panelBackground};
      }

      .textHeading {
        font-size: 16px;
        color: ${theme.textHeading};
        margin-bottom: 10px;
        font-family: var(--lato);
      }

      .textSubheading {
        font-size: 14px;
        color: ${theme.textSubheading};
        margin: 5px 0px;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        font-family: var(--lato);
      }

      .textDescription {
        font-size: 12px;
        color: ${theme.textDescription};
        font-family: var(--lato);
      }

      .panelCardContainer {
        display: grid;
        grid-gap: 10px;
        grid-template-columns: 1fr 1fr 1fr;
      }

      .panelCard {
        width: 100%;
        padding: 10px;
        border-radius: 4px;
        background: ${theme.panelCards};
      }

      .panelCardImage {
        width: 100%;
        height: 125px;
        background-size: cover;
        background-image: url(/static/etherealengine.png);
      }

      .panelCard:hover {
        border: solid 1px ${theme.panelCardHoverOutline};
      }

      .panelCardIcon {
        width: 24px;
        height: 24px;
        padding: 0;
        color: ${theme.panelCardIcon};
      }

      .iconButtonContainer {
        display: flex;
        flex-direction: column;
      }

      .iconButtonContainer label {
        margin: 5px 0px;
      }

      .buttonContainer {
        display: flex;
        flex-direction: column;
      }

      .buttonContainer label {
        margin: 5px 0px;
      }

      .iconButton {
        width: 40px;
        height: 40px;
        border-radius: 4px;
        color: ${theme.iconButtonColor};
        background: ${theme.iconButtonBackground};
      }

      .iconButtonSelected {
        width: 40px;
        height: 40px;
        border-radius: 4px;
        color: ${theme.iconButtonColor};
        background: ${theme.iconButtonSelectedBackground};
      }

      .iconButtonSelected:hover {
        opacity: 0.8;
        background: ${theme.iconButtonHoverColor};
      }

      .iconButton:hover {
        opacity: 0.8;
        background: ${theme.iconButtonHoverColor};
      }

      .outlinedButton {
        color: ${theme.buttonOutlined};
        background: transparent;
        border: solid 1px ${theme.buttonOutlined};
      }

      .outlinedButton:hover {
        opacity: 0.7;
      }

      .filledButton {
        margin: 0px;
        color: ${theme.buttonTextColor};
        background: ${theme.buttonFilled};
      }

      .filledButton:hover {
        opacity: 0.8;
      }

      .gradientButton {
        color: ${theme.buttonTextColor};
        background: linear-gradient(90deg, ${theme.buttonGradientStart}, ${theme.buttonGradientEnd});
      }

      .gradientButton:hover {
        opacity: 0.8;
      }

      .input {
        border-radius: 4px;
        color: ${theme.textColor};
        background: ${theme.inputBackground};
        border: solid 1px ${theme.inputOutline};
      }

      .input input {
        padding: 4px 5px 5px;
      }

      .select {
        height: 2.4rem !important;
        color: ${theme.textColor} !important;
        background: ${theme.inputBackground};
        border: solid 1px ${theme.inputOutline};
      }

      .select svg {
        color: ${theme.textColor}
      }
      
      .selectPaper {
        background-color: ${theme.dropdownMenuBackground};
        color: ${theme.textColor};
      }

      .option:global(.Mui-focused){
        background-color: ${theme.dropdownMenuHoverBackground};
      }

      .optionSelected{
        background-color: ${theme.dropdownMenuSelectedBackground} !important;
      }
      
      .option:hover {
        background-color: ${theme.dropdownMenuHoverBackground};
      }

      .drawer {
        background-color: ${theme.drawerBackground};
      }

      .tableBox {
        margin: 20px 20px 0px;
      }

      .tableContainer {
        max-height: 100%;
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        min-height: 0;
      }
      
      .tableCellHeader {
        background: ${theme.tableHeaderBackground} !important;
        color: ${theme.textColor} !important;
        border-bottom: 2px solid ${theme.mainBackground} !important;
      }
      
      .tableCellBody {
        border-bottom: 1px solid ${theme.mainBackground} !important;
        color: ${theme.textColor} !important;
        background: ${theme.tableCellBackground} !important;
      }
      
      .tableFooter {
        background: ${theme.tableFooterBackground} !important;
        color: ${theme.textColor} !important;
        overflow: unset;
      }

      .actionStyle {
        text-decoration: none;
        color: ${theme.textColor};
        margin-right: 10px;
      }
      
      .spanWhite {
        color: ${theme.textColor} !important;
      }

      .spanDange {
        color: var(--orange) !important;
      }

      .spanWhite:hover, .spanDange:hover {
        opacity: 0.7;
      }

      .popupMainBackground {
        background: unset;
      }

      .drawerPaper {
        width: 100%;
        height: 100%;
        max-width: 600px;
        max-height: 500px; 
        background: ${theme.popupBackground};
      }

      .dockClickAway {
        width: 100%;
        height: 100%;
        background: transparent;
        position: absolute;
        left: 0;
        top: 0;
      }

      .dockBackground {
        width: 30%;
        height: 100%;
        position: absolute;
        left: 0;
        top: 0;
        background: ${theme.dockBackground};
      }
    `}
    </style>
  )
}

export default DemoStyle
