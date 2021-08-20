import React from 'react'
import Search from './SearchInstance'
import InstanceTable from './InstanceTable'
import { useInstanceStyles } from './styles'

const Instance = () => {
  const classes = useInstanceStyles()

  return (
    <div>
      <div className={classes.marginBottm}>
        <Search />
      </div>

      <div className={classes.rootTable}>
        <InstanceTable />
      </div>
    </div>
  )
}

export default Instance
