import React from 'react'
import Search from '../../common/Search'
import InstanceTable from './InstanceTable'
import { useStyles } from '../../styles/ui'

const Instance = () => {
  const classes = useStyles()
  const [search, setSearch] = React.useState('')

  const handleChange = (e: any) => {
    setSearch(e.target.value)
  }

  return (
    <div>
      <div className={classes.marginBottm}>
        <Search text="instance" handleChange={handleChange} />
      </div>
      <div className={classes.rootTable}>
        <InstanceTable search={search} />
      </div>
    </div>
  )
}

export default Instance
