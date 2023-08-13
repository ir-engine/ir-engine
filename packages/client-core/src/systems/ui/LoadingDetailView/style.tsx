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

const LoadingDetailViewStyle = () => {
  return (
    <style>{`
      #loading-container {
        position: relative;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        font-family: 'Roboto', sans-serif;
      }

      #loading-container img {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        filter: blur(5px);
        color: #FFFFFF;
        height: 'auto';
        max-width: '100%;
      }

      #loading-ui {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 2;
        padding: 2px;
        text-align: center;
        text-shadow: 1px 1px 1px ${'#000'};
        -webkit-font-smoothing: antialiased;
      }

      #loading-text {
        font-size: 15px;
        margin: auto;
        text-align: center;
        padding: 2px;
        color: #FFFFFF;
      }
      
      #progress-text {
        font-size: 25px;
        margin: auto;
        text-align: center;
        padding: 2px;
        color: #FFFFFF;
      }

      #progress-container {
        margin: auto;
        text-align: center;
        padding: 5px;
        width: 100px;
      }
      
      #loading-details {
        font-size: 10px;
        margin: auto;
        text-align: center;
        padding: 2px;
        color: #FFFFFF;
      }
      
    `}</style>
  )
}

export default LoadingDetailViewStyle
