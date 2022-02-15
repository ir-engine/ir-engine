import React, { useEffect, useState } from 'react'
import { useAuthState } from '../../../user/services/AuthService'
import { AVATAR_PAGE_LIMIT } from '../../services/AvatarService'
import { useAvatarState } from '../../services/AvatarService'
import { AvatarService } from '../../services/AvatarService'
import { useStyles } from '../../styles/ui'
import TableComponent from '../../common/Table'
import { avatarColumns, AvatarData } from '../../common/variables/avatar'
import ConfirmModel from '../../common/ConfirmModel'
import ViewAvatar from './ViewAvatar'

if (!global.setImmediate) {
  global.setImmediate = setTimeout as any
}

interface Props {
  locationState?: any
  search: string
}

const AvatarTable = (props: Props) => {
  const adminAvatarState = useAvatarState()
  const authState = useAuthState()
  const user = authState.user
  const adminAvatars = adminAvatarState.avatars
  const adminAvatarCount = adminAvatarState.total
  const classes = useStyles()

  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(AVATAR_PAGE_LIMIT)
  const [refetch, setRefetch] = useState(false)
  const [popConfirmOpen, setPopConfirmOpen] = useState(false)
  const [avatarId, setAvatarId] = useState('')
  const [avatarName, setAvatarName] = useState('')
  const [viewModel, setViewModel] = useState(false)
  const [avatarAdmin, setAvatarAdmin] = useState(null)

  const handlePageChange = (event: unknown, newPage: number) => {
    const incDec = page < newPage ? 'increment' : 'decrement'
    AvatarService.fetchAdminAvatars(incDec, newPage)
    setPage(newPage)
  }

  const handleCloseModel = () => {
    setPopConfirmOpen(false)
  }

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  useEffect(() => {
    if (user?.id.value && (adminAvatarState.updateNeeded.value || refetch === true)) {
      AvatarService.fetchAdminAvatars()
    }
    setRefetch(false)
  }, [authState.user?.id?.value, adminAvatarState.updateNeeded.value, refetch])

  const createData = (el: any, sid: any, name: string | undefined, key: string | undefined): AvatarData => {
    return {
      el,
      sid,
      name,
      key,
      action: (
        <>
          <a
            href="#h"
            className={classes.actionStyle}
            onClick={() => {
              setAvatarAdmin(el)
              setViewModel(true)
            }}
          >
            <span className={classes.spanWhite}>View</span>
          </a>
          <a
            href="#h"
            className={classes.actionStyle}
            onClick={() => {
              setPopConfirmOpen(true)
              setAvatarId(el.id)
              setAvatarName(name as any)
            }}
          >
            <span className={classes.spanDange}>Delete</span>
          </a>
        </>
      )
    }
  }

  const rows = adminAvatars.value.map((el) => {
    return createData(el, el.sid, el.name, el.key)
  })

  const submitRemoveAvatar = async () => {
    await AvatarService.removeAdminAvatar(avatarId)
    setPopConfirmOpen(false)
  }

  const closeViewModel = (open) => {
    setViewModel(open)
  }

  return (
    <React.Fragment>
      <TableComponent
        rows={rows}
        column={avatarColumns}
        page={page}
        rowsPerPage={rowsPerPage}
        count={adminAvatarCount.value}
        handlePageChange={handlePageChange}
        handleRowsPerPageChange={handleRowsPerPageChange}
      />
      {/* {avatarSelectMenuOpen && (
          <AvatarSelectMenu changeActiveMenu={() => setAvatarSelectMenuOpen(false)} isPublicAvatar={true} />
        )} */}

      <ConfirmModel
        popConfirmOpen={popConfirmOpen}
        handleCloseModel={handleCloseModel}
        submit={submitRemoveAvatar}
        name={avatarName}
        label={'avatar'}
      />
      {avatarAdmin && viewModel && (
        <ViewAvatar openView={viewModel} avatarData={avatarAdmin} closeViewModel={closeViewModel} />
      )}
    </React.Fragment>
  )
}

export default AvatarTable
