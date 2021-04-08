
export type ActivityHistory = {
  owner?: string
  name: string
  to?: string
  from?: string
  time: Date
}

export type ActivityLineProps = {
  activity: ActivityHistory
}

const ActivityLine = ({ activity }: ActivityLineProps) => {
  return (
    <div>
      {activity.from && (
        <p>
            Bought <b>{activity.name}</b> from <b>{activity.from}</b> at{' '}
            {activity.time.toLocaleDateString('en-GB')} -{' '}
            {activity.time.toLocaleTimeString('en-GB')}
        </p>
      )}
      {activity.to && (
        <div>
            Sold <b>{activity.name}</b> to <b>{activity.to}</b> at{' '}
            {activity.time.toLocaleDateString('en-GB')} -{' '}
            {activity.time.toLocaleTimeString('en-GB')}
        </div>
      )}
    </div>
  )
}

export default ActivityLine
