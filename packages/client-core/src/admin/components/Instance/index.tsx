import React from 'react'
import Search from '../../common/Search'
import { useStyles } from '../../styles/ui'
import InstanceTable from './InstanceTable'

const Instance = () => {
  const classes = useStyles()
  const [search, setSearch] = React.useState('')

  const handleChange = (e: any) => {
    setSearch(e.target.value)
  }

  return (
    <React.Fragment>
      <div className={classes.marginBottom}>
        <Search text="instance" handleChange={handleChange} />
      </div>
      <div className={classes.rootTableWithSearch}>
        <InstanceTable search={search} />
      </div>
    </React.Fragment>
  )
}

export default Instance
