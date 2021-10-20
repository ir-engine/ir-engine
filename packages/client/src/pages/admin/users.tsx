/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import React, { useEffect } from 'react'
import CreatorConsole from '@standardcreative/social/src/components/admin/CreatorConsole'
import { useCreatorState } from '@standardcreative/client-core/src/social/state/CreatorState'
import { CreatorService } from '@standardcreative/client-core/src/social/state/CreatorService'
import Dashboard from '@standardcreative/social/src/components/Dashboard'
import { useDispatch } from '@standardcreative/client-core/src/store'

const UsersPage = () => {
  const creatorsState = useCreatorState()
  const dispatch = useDispatch()
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
