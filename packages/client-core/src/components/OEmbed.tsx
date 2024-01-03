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
  const oEmbed = oEmbedState.oEmbed

  const location = useLocation()
  const oembedLink = `${config.client.serverUrl}/oembed?url=${encodeURIComponent(
    `${config.client.clientUrl}${location.pathname}`
  )}&format=json`

  console.log({ oembedLink })

  useEffect(() => {
    if (pathname !== location.pathname) {
      OEmbedState.fetchData(location.pathname, `${config.client.clientUrl}${location.pathname}`)
    }
  }, [location.pathname])

  return (
    <MetaTags>
      {oembedLink && <link href={oembedLink} type="application/json+oembed" rel="alternate" title="Cool Pants" />}
      {oEmbed.value && pathname === location.pathname ? (
        <>
          <title>{oEmbed.value.title}</title>
          <meta name="description" content={oEmbed.value.description} />

          <meta property="og:type" content="website" />
          <meta property="og:url" content={oEmbed.value.query_url} />
          <meta property="og:title" content={oEmbed.value.title} />
          <meta property="og:description" content={oEmbed.value.description} />
          <meta
            property="og:image"
            content={oEmbed.value.url ? oEmbed.value.url : `${oEmbed.value.provider_url}/static/etherealengine.png`}
          />

          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:domain" content={oEmbed.value.provider_url?.replace('https://', '')} />
          <meta name="twitter:title" content={oEmbed.value.title} />
          <meta name="twitter:description" content={oEmbed.value.description} />
          <meta
            property="twitter:image"
            content={oEmbed.value.url ? oEmbed.value.url : `${oEmbed.value.provider_url}/static/etherealengine.png`}
          />
          <meta name="twitter:url" content={oEmbed.value.query_url} />
          <link href="/dist/index.css" rel="stylesheet" />
        </>
      ) : (
        <></>
      )}
    </MetaTags>
  )
}

export default OEmbed
