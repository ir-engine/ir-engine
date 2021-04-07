import { toSvg } from 'jdenticon'
import { useStateContext } from '../state'
import { useHistory } from 'react-router'

export type UserMenuProps = {
  //
}

const UserMenu = () => {
  const {
    state: { user, isAuthenticated },
  } = useStateContext()

  const history = useHistory()

  return (
    <div>
      {isAuthenticated && user && (
        <>
          <h5>
            {user.address}
          </h5>
          <div
            onClick={() => {
              history.push('/profile')
            }}
            dangerouslySetInnerHTML={{ __html: toSvg(user.address, 30) }}
          />
        </>
      )}
    </div>
  )
}

export default UserMenu
