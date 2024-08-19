/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon'
import React from 'react'

export const TwitterIcon = (props: SvgIconProps) => {
  return (
    <SvgIcon {...props}>
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M12.5792 36.2521C27.6736 36.2521 35.9296 23.7465 35.9296 12.9017C35.9296 12.5465 35.9296 12.1929 35.9056 11.8409C37.5117 10.6791 38.8982 9.24069 40 7.59288C38.5023 8.25688 36.9134 8.69214 35.2864 8.88408C36.9997 7.85856 38.2819 6.24539 38.8944 4.34488C37.2835 5.30089 35.5211 5.97459 33.6832 6.33688C32.4459 5.02118 30.8094 4.14995 29.027 3.85802C27.2446 3.56609 25.4157 3.86974 23.8233 4.72197C22.2309 5.5742 20.9637 6.9275 20.2179 8.57246C19.4721 10.2174 19.2892 12.0623 19.6976 13.8217C16.4348 13.658 13.2429 12.8101 10.3291 11.3329C7.41526 9.85571 4.84461 7.78231 2.784 5.24728C1.73455 7.05394 1.41312 9.19266 1.88517 11.228C2.35721 13.2633 3.58724 15.0422 5.3248 16.2025C4.01872 16.1642 2.74108 15.8119 1.6 15.1753V15.2793C1.60052 17.174 2.25642 19.0103 3.45645 20.4766C4.65648 21.9428 6.32677 22.9489 8.184 23.3241C6.9758 23.6536 5.70812 23.7018 4.4784 23.4649C5.00302 25.0954 6.02405 26.5213 7.39873 27.5431C8.77342 28.5649 10.433 29.1317 12.1456 29.1641C10.4441 30.5015 8.49552 31.4904 6.41146 32.0741C4.32739 32.6578 2.14869 32.8248 0 32.5657C3.75306 34.974 8.11987 36.2515 12.5792 36.2457"
          fill="#1DA1F2"
        />
      </svg>
    </SvgIcon>
  )
}
