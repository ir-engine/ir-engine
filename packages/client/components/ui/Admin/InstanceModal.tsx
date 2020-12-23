import React, {useEffect, useState, useRef} from 'react';
import { connect } from 'react-redux';
import { selectAdminState } from "../../../redux/admin/selector";
import styles from './Admin.module.scss';
import {
    Backdrop,
    Button,
    Fade,
    Modal,
    TableRow,
    TableCell,
    Table,
    TableBody,
    TableContainer,
    TableHead,
    TableSortLabel
} from '@material-ui/core';
import classNames from 'classnames';
import {selectAppState} from "../../../redux/app/selector";
import {selectAuthState} from "../../../redux/auth/selector";
import {bindActionCreators, Dispatch} from "redux";
import {client} from "../../../redux/feathers";
import { Router, withRouter } from "next/router";

interface Props {
    router: Router,
    open: boolean;
    handleClose: any;
    instance: any;
    adminState?: any;
}

const mapStateToProps = (state: any): any => {
    return {
        appState: selectAppState(state),
        authState: selectAuthState(state),
        adminState: selectAdminState(state)
    };
};

const mapDispatchToProps = (dispatch: Dispatch): any => ({});

const InstanceModal = (props: Props): any => {
    const {
        router,
        open,
        handleClose,
        instance
    } = props;

    const currentInstanceId = useRef();

    const [instanceUsers, setInstanceUsers] = useState([]);

    const getInstanceUsers = async () => {
        if (instance?.id != null && instance?.id !== '' && currentInstanceId.current === instance.id) {
            const instanceUserResult = await client.service('user').find({
                query: {
                    $limit: 1000,
                    instanceId: instance.id
                }
            });
            setInstanceUsers(instanceUserResult.data);
            if (instanceUserResult.total === 0) handleClose();
            else setTimeout(() => {
                getInstanceUsers();
            }, 2000);
        }
    };

    useEffect(() => {
        currentInstanceId.current = instance?.id;
        getInstanceUsers();
    }, [instance]);

    type Order = 'asc' | 'desc';

    interface EnhancedTableProps {
        object: string,
        order: Order;
        orderBy: string;
        rowCount: number;
    }

    const headCells = [
        { id: 'id', numeric: false, disablePadding: true, label: 'ID' },
        { id: 'name', numeric: false, disablePadding: false, label: 'Name' },
        { id: 'instanceId', numeric: false, disablePadding: false, label: 'Instance ID' },
        { id: 'userRole', numeric: false, disablePadding: false, label: 'User Role'},
        { id: 'partyId', numeric: false, disablePadding: false, label: 'Party ID' }
    ];

    const redirectToInstance = async () => {
        try {
            const location = await client.service('location').get(instance.locationId);
            const route = `/location/${location.slugifiedName}?instanceId=${instance.id}`;
            router.push(route);
        } catch(err) {
            console.log('Error redirecting to instance:');
            console.log(err);
        }
    };

    function EnhancedTableHead(props: EnhancedTableProps) {
        const { order, orderBy } = props;

        return (
            <TableHead className={styles.thead}>
                <TableRow className={styles.trow}>
                    {headCells.map((headCell) => (
                        <TableCell
                            className={styles.tcell}
                            key={headCell.id}
                            align='right'
                            padding={headCell.disablePadding ? 'none' : 'default'}
                            sortDirection={orderBy === headCell.id ? order : false}
                        >
                            <TableSortLabel
                                active={orderBy === headCell.id}
                                direction={orderBy === headCell.id ? order : 'asc'}
                            >
                                {headCell.label}
                            </TableSortLabel>
                        </TableCell>
                    ))}
                </TableRow>
            </TableHead>
        );
    }

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
                        <div className={styles.instanceUsersHeader}>
                            <div>Users on instance {instance.id}</div>
                            <Button variant="contained" color="primary" onClick={redirectToInstance}>Go to Instance</Button>
                        </div>
                        <TableContainer>
                            <Table
                                aria-labelledby="tableTitle"
                                size='medium'
                                aria-label="enhanced table"
                            >
                                <EnhancedTableHead
                                    object='users'
                                    order={'asc'}
                                    orderBy={'name'}
                                    rowCount={instanceUsers?.length || 0}
                                />
                                <TableBody className={styles.thead}>
                                    {instanceUsers != null && instanceUsers
                                        .map((row, index) => {
                                            return (
                                                <TableRow
                                                    className={styles.trow}
                                                    style={{color: 'black !important'}}
                                                    // onClick={(event) => handleClick(event, row.id.toString())}
                                                    tabIndex={-1}
                                                    key={row.id}
                                                >
                                                    <TableCell className={styles.tcell} component="th" id={row.id.toString()}
                                                               align="right" scope="row" padding="none">
                                                        {row.id}
                                                    </TableCell>
                                                    <TableCell className={styles.tcell} align="right">{row.name}</TableCell>
                                                    <TableCell className={styles.tcell}
                                                               align="right"
                                                    >{row.instanceId}</TableCell>
                                                    <TableCell className={styles.tcell} align="right">{row.userRole}</TableCell>
                                                    <TableCell className={styles.tcell} align="right">{row.partyId}</TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    {/*{emptyRows > 0 && (*/}
                                    {/*    <TableRow style={{ height: (dense ? 33 : 53) * emptyRows }}>*/}
                                    {/*        <TableCell colSpan={6} />*/}
                                    {/*    </TableRow>*/}
                                    {/*)}*/}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </div>
                </Fade>
            </Modal>
        </div>
    );
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(InstanceModal));
