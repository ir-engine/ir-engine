import React from 'react'
import Container from '@material-ui/core/Container'
import { useStyle, useStyles } from './styles'

interface Props{
    onCloseEdit: any
}

const EditCreator = (props: Props) => {
    const { onCloseEdit } = props
    const classex = useStyle()
    const classes = useStyles()
return <Container maxWidth="sm" className={classes.space} >
    <div>Editing.....</div>
</Container>
}


export default EditCreator