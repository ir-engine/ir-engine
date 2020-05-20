import './style.scss'

type Props = {
  loadPercent: number
}
const LoadingBar = ({ loadPercent }: Props) => {
  return (
    <div className="LoadingBar">
      <h2>Loading</h2>
      <div className="loading-bar-outline" />
      <div className='progress-bar' style={{
        width: loadPercent + '%'
      }} />
    </div>
  )
}
export default LoadingBar
