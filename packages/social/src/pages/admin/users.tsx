/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import React, { useEffect } from 'react'
import CreatorConsole from '@xrengine/social/src/components/admin/CreatorConsole'
import { useCreatorState } from '@xrengine/client-core/src/social/state/CreatorService'
import { CreatorService } from '@xrengine/client-core/src/social/state/CreatorService'
import Dashboard from '@xrengine/social/src/components/Dashboard'

const UsersPage = () => {
  const creatorsState = useCreatorState()
  useEffect(() => {
    CreatorService.getCreators()
  }, [creatorsState.creators.currentCreator])
  const creators =
    creatorsState && creatorsState.creators.fetching.value === false && creatorsState.creators.value
      ? creatorsState.creators
      : null
  return (
    <>
      <div>
        <Dashboard>{creators && <CreatorConsole list={creators} />}</Dashboard>
      </div>
    </>
  )
}

export default UsersPage
