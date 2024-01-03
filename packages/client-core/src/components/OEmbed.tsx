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

import { config } from '@etherealengine/common/src/config'
import { getMutableState } from '@etherealengine/hyperflux'
import { useHookstate } from '@hookstate/core'
import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import MetaTags from '../common/components/MetaTags'
import { OEmbedState } from '../common/services/OEmbedService'

export const OEmbed = () => {
  const oEmbedState = useHookstate(getMutableState(OEmbedState))
  const pathname = oEmbedState.pathname.value
  const oEmbed = oEmbedState.oEmbed.value

  const location = useLocation()
  const oembedLink = `${config.client.serverUrl}/oembed?url=${encodeURIComponent(
    `${config.client.clientUrl}${location.pathname}`
  )}&format=json`

  useEffect(() => {
    if (pathname !== location.pathname) {
      OEmbedState.fetchData(location.pathname, `${config.client.clientUrl}${location.pathname}`)
    }
  }, [location.pathname])

  return (
    <MetaTags>
      <link href={oembedLink} type="application/json+oembed" rel="alternate" title="oEmbed Profile" />
      {oEmbed && pathname === location.pathname && (
        <>
          <title>{oEmbed.title}</title>
          <meta name="description" content={oEmbed.description} />

          <meta property="og:type" content="website" />
          <meta property="og:url" content={oEmbed.query_url} />
          <meta property="og:title" content={oEmbed.title} />
          <meta property="og:description" content={oEmbed.description} />
          <meta
            property="og:image"
            content={oEmbed.url ? oEmbed.url : `${oEmbed.provider_url}/static/etherealengine.png`}
          />

          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:domain" content={oEmbed.provider_url?.replace('https://', '')} />
          <meta name="twitter:title" content={oEmbed.title} />
          <meta name="twitter:description" content={oEmbed.description} />
          <meta
            property="twitter:image"
            content={oEmbed.url ? oEmbed.url : `${oEmbed.provider_url}/static/etherealengine.png`}
          />
          <meta name="twitter:url" content={oEmbed.query_url} />
        </>
      )}
    </MetaTags>
  )
}

export default OEmbed
