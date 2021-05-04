import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import Autocomplete from '@material-ui/lab/Autocomplete';
import { createUser as createUserAction }  from "../../reducers/admin/service";
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';

interface Props {
    open: boolean;
    handleClose: any;
    adminState?: any;
    createUserAction?: any;
    adminLocations: Array<any>;
    editing: boolean;
    userEdit: any;
    patchUser?: any;
    
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
    createUserAction: bindActionCreators(createUserAction, dispatch)
});



const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        marginBottm: {
            marginBottom: "15px"
        }
    })
);
const createUser = (props: Props) => {
    const { open, handleClose, createUserAction, adminLocations } = props;
    const classes = useStyles();
    const [game, setGame] = React.useState('');
    const [name, setName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [status, setStatus] = React.useState('');
    const [location, setLocation] = React.useState('');

    const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        setGame(event.target.value as string);
    };

    const defaultProps = {
        options: adminLocations,
        getOptionLabel: (option: any ) => option.name,
    };

    const submitData = async () => {
        const data = {
            email,
            name,
            location,
            game,
            status
        };
        await createUserAction(data);
        handleClose();
    };
    return (
        <div>
            <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">Create New User</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="email"
                        label="E-mail"
                        type="email"
                        fullWidth
                        value={email}
                        className={classes.marginBottm}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label="Name"
                        type="text"
                        fullWidth
                        value={name}
                        className={classes.marginBottm}
                        onChange={(e) => setName(e.target.value)}
                    />

                    <Autocomplete
                        onChange={(e, newValue)=>  setLocation(newValue.name as string)}
                        {...defaultProps}
                        id="debug"
                        debug
                        renderInput={(params) => <TextField {...params} label="Location" className={classes.marginBottm} />}
                    />


                    <FormControl fullWidth className={classes.marginBottm}>
                        <InputLabel id="demo-simple-select-label">Game Name</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={game}
                            onChange={handleChange}
                        >
                            <MenuItem value="Club night">Club night</MenuItem>
                            <MenuItem value="Golf Game">Golf Game</MenuItem>
                            <MenuItem value="Football">Football</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl fullWidth className={classes.marginBottm}>
                        <InputLabel id="demo-simple-select-label">User Role</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={status}
                            disabled={game ? false : true}
                            onChange={(e) => setStatus(e.target.value as string)}
                        >
                            <MenuItem value="Player (DJ)">Player (DJ)</MenuItem>
                            <MenuItem value="Host">Host</MenuItem>
                            <MenuItem value="Observer">Observer</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={submitData} color="primary">
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default connect(null, mapDispatchToProps)( createUser);