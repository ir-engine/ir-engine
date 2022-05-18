import React from 'react'
import AppFooter from '@xrengine/social/src/components/Footer'
import Creator from '@xrengine/social/src/components/Creator'

import { useLocation } from 'react-router-dom'

export default function CreatorPage() {
  const creatorId = new URLSearchParams(useLocation().search).get('creatorId').toString()
  return (
    <>
      <div>
        <Creator creatorId={creatorId} />
        <AppFooter />
      </div>
    </>
  )
}
