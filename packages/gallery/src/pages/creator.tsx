import Creator from '@xrengine/social/src/components/Creator'
import React from 'react'
import { useLocation } from 'react-router-dom'

export default function CreatorPage() {
  const creatorId = new URLSearchParams(useLocation().search).get('creatorId').toString()
  return (
    <>
      <div>
        <Creator creatorId={creatorId} />
      </div>
    </>
  )
}
