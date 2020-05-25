import './style.scss'

type Props = {
  loadPercent: number
}
const LoadingBar = ({ loadPercent }: Props) => {
  return (
    <div className="LoadingBar">
      <div className="loading-bar-outline" />
      <div className='progress-bar' style={{
        width: loadPercent + '%'
      }} />
    </div>
  )
}
export default LoadingBar
