import UserMenu from './UserMenu'

export type HeaderProps = {
  //
}

const Header = () => {
  return (
    <div>
      <h3> ERC721 Marketplace + OpenSea.io on Rinkeby Network </h3>
      <UserMenu />
    </div>
  )
}

export default Header
