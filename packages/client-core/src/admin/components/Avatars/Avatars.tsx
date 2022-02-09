import React, { useEffect, useState } from 'react'
import { useAuthState } from '../../../user/services/AuthService'
import { AVATAR_PAGE_LIMIT } from '../../services/AvatarService'
import { useAvatarState } from '../../services/AvatarService'
import { AvatarService } from '../../services/AvatarService'
import { useStyles } from '../../styles/ui'
import TableComponent from '../../common/Table'
import { avatarColumns, AvatarData } from '../../common/variables/avatar'

if (!global.setImmediate) {
  global.setImmediate = setTimeout as any
}

interface Props {
  locationState?: any
}

const Avatars = (props: Props) => {
  const adminAvatarState = useAvatarState()
  const authState = useAuthState()
  const user = authState.user
  const adminAvatars = adminAvatarState.avatars
  const adminAvatarCount = adminAvatarState.total
  const classes = useStyles()

  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(AVATAR_PAGE_LIMIT)
  const [refetch, setRefetch] = useState(false)

  const handlePageChange = (event: unknown, newPage: number) => {
    const incDec = page < newPage ? 'increment' : 'decrement'
    AvatarService.fetchAdminAvatars(incDec)
    setPage(newPage)
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

  const createData = (sid: any, name: string, key: string): AvatarData => {
    return {
      sid,
      name,
      key,
      action: (
        <>
          <a href="#h" className={classes.actionStyle}>
            <span className={classes.spanWhite}>View</span>
          </a>
          <a href="#h" className={classes.actionStyle}>
            <span className={classes.spanDange}>Delete</span>
          </a>
        </>
      )
    }
  }

  const rows = adminAvatars.value.map((el) => {
    return createData(el.sid, el.name, el.key)
  })

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
    </React.Fragment>
  )
}

export default Avatars
