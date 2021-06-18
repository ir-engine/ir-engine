import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { useStyle } from "./styles";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";

export default function UpdateBot(props) {
    const { open } = props;
    const classx = useStyle();

    return (
        <div>
            <Dialog
                open={open}
                aria-labelledby="form-dialog-title"
                classes={{ paper: classx.dialoPaper }}
            >
                <DialogTitle id="form-dialog-title">Update bot</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label="Name"
                        type="text"
                        fullWidth
                    />
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label="Description"
                        type="text"
                        fullWidth
                    />

                    <Select
                        labelId="demo-controlled-open-select-label"
                        id="demo-controlled-open-select"
                        // open={open}
                        //  onClose={handleClose}
                        //onOpen={handleOpen}
                       // className={classes.inputSelect}
                       // value={location}
                        //onChange={(e) => setLocation(e.target.value as string)}
                        fullWidth
                    >
                        <MenuItem value="">
                            <em>None</em>
                        </MenuItem>
                        <MenuItem value="1">1</MenuItem>
                    </Select>

                </DialogContent>
                <DialogActions>
                    <Button
                        //onClick={handleClose} 
                        color="primary">
                        Cancel
                    </Button>
                    <Button
                        // onClick={handleClose} 
                        color="primary">
                        Subscribe
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
