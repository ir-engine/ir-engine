import getConfig from 'next/config'
const LogoImg = getConfig().publicRuntimeConfig.logo

type Props = {
    onClick: any
}

const Logo = (props: Props) => {
  return (
    <div className="logo">
      <img
        src={LogoImg}
        alt="logo"
        crossOrigin="anonymous"
        className="logo"
        onClick={props.onClick ?? null}
      />
    </div>
  )
}

export default Logo
