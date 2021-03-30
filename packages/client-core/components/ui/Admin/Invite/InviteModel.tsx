import React, { useEffect } from "react";
import {
    Backdrop,
    Button,
    Fade,
    FormGroup,
    Modal,
    TextField,
    Typography
} from '@material-ui/core';
import classNames from 'classnames';
import styles from '../Admin.module.scss';
import { sendInvite } from "../../../../redux/invite/service";
import { retrieveInvites } from "../../../../redux/inviteType/service";
import { selectInviteState } from "../../../../redux/invite/selector";
import { selectInviteTypesState  } from "../../../../redux/inviteType/selector";
import { bindActionCreators, Dispatch } from "redux";
import { withRouter, Router } from "next/router";
import { connect } from "react-redux";
import { Dropdown } from 'semantic-ui-react';
import faker from 'faker';
import _ from 'lodash';
import Grid from '@material-ui/core/Grid';

interface Props {
    router: Router;
    open: boolean;
    handleClose: any;
    sendInvite?: any;
    retrieveInvites?: any;
    inviteTypeData?: any;
}

const mapStateToProps = (state: any): any => {
    return {
        receivedInvites: selectInviteState(state),
        sentInvites: selectInviteState(state),
        inviteTypeData: selectInviteTypesState(state)
    };
};

const mapDispatchToProps = (dispatch: Dispatch): any => ({
    sendInvite: bindActionCreators(sendInvite, dispatch),
    retrieveInvites: bindActionCreators(retrieveInvites, dispatch)
});

const currencies = [
    {
        value: 'family',
        label: 'family',
    },
    {
        value: 'freind',
        label: 'freind',
    },
    {
        value: 'group',
        label: 'group',
    }
];

/**
 * Dev comment: => I don't know use of Token in the form field
 * @param props 
 */
const InviteModel = (props: Props) => {
    const {
        open,
        handleClose,
        sendInvite,
        retrieveInvites,
        inviteTypeData
    } = props;
    const [currency, setCurrency] = React.useState('EUR');

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCurrency(event.target.value);
    };

    const createInvite = async () => {
        const data = {
            "token": "string",
            "identityProviderType": "string",
            "passcode": "string",
            "targetObjectId": "string"
        };
        await sendInvite(data);
    };

    const addressDefinitions = faker.definitions.address;
    const stateOptions = _.map(addressDefinitions.state, (state, index) => ({
        key: addressDefinitions.state_abbr[index],
        text: state,
        value: addressDefinitions.state_abbr[index],
    }));

    console.log('====================================');
    console.log(inviteTypeData);
    console.log('====================================');

    useEffect(()=>{
        const fetchData = async () => {
           await retrieveInvites();
        };
        fetchData();
    }, []);

    return (
        <div>
            <Modal
                aria-labelledby="transition-modal-title"
                aria-describedby="transition-modal-description"
                className={styles.modal}
                open={open}
                onClose={handleClose}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{
                    timeout: 500
                }}
            >
                <Fade in={props.open}>
                    <div className={classNames({
                        [styles.paper]: true,
                        [styles['modal-content']]: true
                    })}>
                        <Typography variant="h5" align="center" className="mt-4 mb-4" component="h4">
                             Send Invite 
                        </Typography>
                        <Dropdown
                            placeholder='State'
                            fluid
                            multiple
                            search
                            selection
                            options={stateOptions}
                        />

                        <Grid container spacing={3}>
                            <Grid item xs={6}>
                                <TextField
                                    variant="outlined"
                                    margin="normal"
                                    fullWidth
                                    id="passcode"
                                    label="Enter Passcode"
                                    name="passcode"
                                    required
                                //  value={passcode}
                                // onChange={(e) => setName(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    id="outlined-select-currency-native"
                                    select
                                    label="Target type"
                                    value={currency}
                                    onChange={handleChange}
                                    SelectProps={{
                                        native: true,
                                    }}
                                    fullWidth
                                    margin="normal"
                                    required
                                    variant="outlined"
                                >
                                    {currencies.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </TextField>
                            </Grid>
                        </Grid>

                        
                        <TextField
                            variant="outlined"
                            margin="normal"
                            fullWidth
                            id="maxUsers"
                            label="Token"
                            name="token"
                            required
                            className="mb-4"
                            //  value={avatar}
                            //onChange={(e) => setAvatar(e.target.value)}
                            />
                        <FormGroup row className={styles.locationModalButtons}>

                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                onClick={createInvite}
                            >
                               Send Invitation 
                          </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                onClick={handleClose}
                            >
                                Cancel
                            </Button>
                        </FormGroup>
                    </div>
                </Fade>
            </Modal>
        </div>
    );
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(InviteModel));