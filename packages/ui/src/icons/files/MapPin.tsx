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

import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const MapPin = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 468 92"
    role="img"
    stroke="currentColor"
    ref={ref}
    {...props}
  >
    <path
      fill="#374151"
      d="M1.074 85v-7.636h1.133v1.193h.1q.239-.612.77-.95.533-.343 1.278-.343.756 0 1.258.343.507.338.79.95h.08q.294-.592.88-.94.587-.353 1.407-.353 1.024 0 1.675.642.651.636.652 1.983V85H9.923v-5.11q0-.846-.462-1.209a1.7 1.7 0 0 0-1.089-.363q-.806 0-1.248.487-.442.483-.442 1.223V85H5.489v-5.23q0-.651-.423-1.05-.423-.402-1.089-.402-.458 0-.855.244a1.84 1.84 0 0 0-.636.676q-.24.428-.239.99V85zm15.051.16q-.954 0-1.685-.483-.73-.487-1.143-1.372-.413-.891-.413-2.103 0-1.203.412-2.088.413-.885 1.149-1.368.735-.482 1.7-.482.746 0 1.178.249.438.243.667.557.233.307.363.507h.1v-1.213h1.172V85h-1.133v-1.173h-.14q-.128.209-.367.527-.24.314-.681.561-.443.244-1.179.244m.16-1.055q.705 0 1.193-.368.486-.372.74-1.029.255-.661.254-1.526 0-.856-.249-1.497-.247-.645-.735-1.004-.487-.363-1.204-.363-.745 0-1.242.383a2.3 2.3 0 0 0-.741 1.03q-.244.646-.244 1.45 0 .816.249 1.482.253.662.746 1.054.496.388 1.232.388m5.652 3.759v-10.5h1.134v1.213h.139q.129-.2.358-.507.234-.314.666-.557.438-.249 1.183-.249.965 0 1.7.482.736.483 1.149 1.368t.413 2.088q0 1.213-.413 2.103-.412.885-1.143 1.372-.732.482-1.686.482-.735 0-1.178-.244a2.2 2.2 0 0 1-.681-.561 8 8 0 0 1-.368-.527h-.1v4.037zm1.154-6.682q0 .864.253 1.526.255.656.74 1.03.488.367 1.194.367.735 0 1.228-.388a2.37 2.37 0 0 0 .746-1.054q.253-.666.253-1.481 0-.806-.248-1.452a2.24 2.24 0 0 0-.741-1.029q-.491-.383-1.238-.383-.715 0-1.203.363-.487.358-.736 1.004-.249.642-.248 1.497m11.752-1.094v1.094H30.39v-1.094zm2.065 7.776v-10.5h1.133v1.213h.14q.129-.2.358-.507.233-.314.666-.557.437-.249 1.183-.249.965 0 1.7.482.736.483 1.149 1.368.412.885.412 2.088 0 1.213-.412 2.103-.413.885-1.144 1.372-.73.482-1.685.482-.735 0-1.178-.244a2.2 2.2 0 0 1-.681-.561 8 8 0 0 1-.368-.527h-.1v4.037zm1.153-6.682q0 .864.254 1.526.254.656.74 1.03.487.367 1.194.367.736 0 1.228-.388a2.37 2.37 0 0 0 .745-1.054q.255-.666.254-1.481 0-.806-.248-1.452a2.24 2.24 0 0 0-.741-1.029q-.492-.383-1.238-.383-.716 0-1.203.363-.487.358-.736 1.004-.249.642-.249 1.497M45.44 85v-7.636h1.173V85zm.597-8.91a.83.83 0 0 1-.592-.233.75.75 0 0 1-.244-.561.75.75 0 0 1 .244-.562.83.83 0 0 1 .592-.234q.343 0 .586.234a.74.74 0 0 1 .249.562.74.74 0 0 1-.249.561.82.82 0 0 1-.586.234m3.899 4.316V85H48.76v-7.636h1.134v1.193h.1q.267-.582.815-.935.546-.358 1.412-.358.776 0 1.357.318.582.314.905.955.323.636.323 1.61V85h-1.174v-4.773q0-.9-.467-1.402-.467-.507-1.282-.507-.562 0-1.005.244-.437.244-.69.71-.255.468-.254 1.134"
    />
    <rect width={139} height={63} x={328.5} y={0.5} stroke="currentColor" strokeDasharray="10 5" rx={4.5} />
    <g stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}>
      <path d="M363.32 29.8a3.52 3.52 0 1 1-7.04 0 3.52 3.52 0 0 1 7.04 0" />
      <path d="M368.6 29.8c0 8.38-8.8 13.2-8.8 13.2s-8.8-4.82-8.8-13.2a8.8 8.8 0 0 1 17.6 0" />
    </g>
    <g stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}>
      <path d="M404.5 28.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
      <path d="M409 28.5c0 7.142-7.5 11.25-7.5 11.25S394 35.642 394 28.5a7.5 7.5 0 0 1 15 0" />
    </g>
    <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}>
      <path d="M442.96 26.4a2.56 2.56 0 1 1-5.12 0 2.56 2.56 0 0 1 5.12 0" />
      <path d="M446.8 26.4c0 6.095-6.4 9.6-6.4 9.6s-6.4-3.505-6.4-9.6a6.4 6.4 0 1 1 12.8 0" />
    </g>
  </svg>
)
const ForwardRef = forwardRef(MapPin)
export default ForwardRef
