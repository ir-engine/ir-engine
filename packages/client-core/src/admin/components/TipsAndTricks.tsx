/**
 * @author Gleb Ordinsky <tanya.vykliuk@gmail.com>
 */
import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import {Button, Typography} from '@material-ui/core';
import Modal from '@material-ui/core/Modal';
import { FormControl, InputLabel, Input, FormHelperText } from '@material-ui/core';
import { Dispatch } from "redux";
import {selectAdminState} from "../reducers/admin/selector";
import { connect } from 'react-redux';
import {getTipsAndTricks, createTipsAndTricks, updateTipsAndTricksAsAdmin, } from "../../socialmedia/reducers/tips_and_tricks/service";
import {selectTipsAndTricksState} from "../../socialmedia/reducers/tips_and_tricks/selector";


const AdminTipsAndTricks = (props) => {
    const tipsList = [
        {
            title: 'Item 1',
            id: '1',
            video: 'video1.mp4',
            description: 'Tip number 1',
        },
        {
            title: 'Item 2',
            id: '2',
            video: 'video2.mp4',
            description: 'Tip number 2',
        },
        {
            title: 'Item 3',
            id: '3',
            video: 'video3.mp4',
            description: 'Tip number 3',
        },
        {
            title: 'Item 4',
            id: '4',
            video: 'video4.mp4',
            description: 'Tip number 4',
        },
    ]

    const useStyles = makeStyles({
        table: {
            minWidth: 650,
        },
        form: {
            display: 'Flex',
            flexDirection: 'column',
            marginLeft: 'auto',
            marginRight: 'auto',
            marginTop: '90px',
            width: 'max-content',
            padding: '60px',
            background: '#fff'
        }
    });
    function createData(title: string, id: string, video: string, description: string) {
        return { title, id, video, description };
    }
    const rows = tipsList.map( i => createData(i.title, i.id, i.video, i.description))
    const classes = useStyles();

    // const [modalStyle] = React.useState(getModalStyle);
    const [open, setOpen] = React.useState(false);

    const [actiontitle, setTitle] = useState(null)
    const [actionId, setId] = useState(null)
    const [actionVideo, setVideo] = useState(null)
    const [actionDescription, setDescription] = useState(null)


    const handleOpen = (title, id, video, description) => {
        setOpen(true);
        if(title){
            setTitle(title)
        }
        if(id){
            setId(id)
        }
        if(video){
            setVideo(video)
        }
        if(description){
            setDescription(description)
        }
        console.log(title, id, video, description)
    };
    const handleClose = () => {
        setOpen(false);
    };
    const handleSubmit = (e:any) =>{
        e.preventDefault();
        // createArMedia({type, title, collectionId});
        setOpen(false);
        console.log('NewItem', {actiontitle, actionId, actionVideo, actionDescription});
    };

    interface Props{
        tipsAndTricks?: any,
        getFeeds?: any
    }

    // useEffect(()=> getFeeds('admin'), []);
    // const feedsList = props.tipsAndTricks.get('feedsAdmin');
    useEffect(()=>{
        console.log('State Log', props.tipsAndTricks);
        // console.log('feedsList', feedsList)
    })

    return (
        <div>
            <Typography variant="h2" color="primary">ARC Tips & Tricks List </Typography>
            <TableContainer component={Paper}>
                <Table className={classes.table} size="small" aria-label="a dense table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Title</TableCell>
                            <TableCell align="right">Id</TableCell>
                            <TableCell align="right">Video</TableCell>
                            <TableCell align="right">Description</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row) => (
                            <TableRow key={row.title}>
                                <TableCell component="th" scope="row">{row.title}</TableCell>
                                <TableCell align="right">{row.id}</TableCell>
                                <TableCell align="right">{row.video}</TableCell>
                                <TableCell align="right">{row.description}</TableCell>
                                <TableCell align="right">
                                    <Button onClick={()=>handleOpen(row.title, row.id, row.video, row.description)}>
                                        Edit
                                    </Button>
                                </TableCell>
                                <TableCell align="right">
                                    <Button>
                                        Delete
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description"
            >
                <div>
                    <form
                        className={classes.form}
                        noValidate
                        onSubmit={(e) => handleSubmit(e)}
                    >
                        <FormControl>
                            <InputLabel htmlFor="tips-and-tricks-title">Title</InputLabel>
                            <Input value={actiontitle && actiontitle}
                                   onChange={(e)=>setTitle(e.target.value)}
                                   id="tips-and-tricks-title" type='text'
                                   aria-describedby="my-helper-text" />
                            <FormHelperText id="my-helper-text">Tip&Trick Title.</FormHelperText>
                        </FormControl>
                        <input
                            value={actionId && actionId}
                            onChange={(e)=>setId(e.target.value)}
                            id="tips-and-tricks-id"
                            type="number"
                            hidden
                        />
                        <Button
                            variant="contained"
                            component="label"
                        >
                            Upload File
                            <input

                                onChange={(e)=>setVideo(e.target.files[0])}
                                id="tips-and-tricks-video"
                                type="file"
                                hidden
                            />
                        </Button>

                        <FormControl>
                            <InputLabel htmlFor="tips-and-tricks-description">Description</InputLabel>
                            <Input value={actionDescription && actionDescription}
                                   onChange={(e)=>setDescription(e.target.value)}
                                   id="tips-and-tricks-description"
                                   type='text' aria-describedby="my-helper-text" />
                            <FormHelperText id="my-helper-text">Tip&Trick short description.</FormHelperText>
                        </FormControl>
                        <Button
                            variant="contained"
                            color="primary"
                            type="submit"
                        >
                            Save
                        </Button>
                        <Button
                            variant="contained"
                            color="secondary"
                        >
                            Close
                        </Button>
                    </form>
                </div>
            </Modal>
        </div>
    )
}



const mapStateToProps = (state: any): any => {
    return {
        // tipsAndTricks: state,
    };
};

const mapDispatchToProps = (dispatch: Dispatch): any => ({
    // getTipsAndTricks: getTipsAndTricks,
    // createTipsAndTricks: createTipsAndTricks,
    // updateTipsAndTricksAsAdmin: updateTipsAndTricksAsAdmin,
});

const ArMediaConsoleTipsAndTricks = connect(mapStateToProps, mapDispatchToProps)(AdminTipsAndTricks);

export default ArMediaConsoleTipsAndTricks