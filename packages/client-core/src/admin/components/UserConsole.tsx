import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { client } from "../../feathers";
import FormControl from '@material-ui/core/FormControl';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Grid from "@material-ui/core/Grid";
// @ts-ignore
import styles from './Admin.module.scss';
import UserModel from "./UserModel";
import Search from "./Search";
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import { Delete, Edit } from '@material-ui/icons';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import Slide from '@material-ui/core/Slide';
import { TransitionProps } from '@material-ui/core/transitions';
import { selectAppState } from '../../common/reducers/app/selector';
import { selectAuthState } from '../../user/reducers/auth/selector';
import { PAGE_LIMIT } from '../reducers/admin/reducers';
import { selectAdminState } from '../reducers/admin/selector';
import { fetchUsersAsAdmin, removeUserAdmin } from '../reducers/admin/service';


if (!global.setImmediate) {
    global.setImmediate = setTimeout as any;
}


interface Props {
    adminState?: any;
    authState?: any;
    locationState?: any;
    fetchAdminLocations?: any;
    fetchAdminScenes?: any;
    fetchLocationTypes?: any;
    fetchUsersAsAdmin?: any;
    fetchAdminInstances?: any;
    removeUser?: any;
}

interface HeadCell {
    disablePadding: boolean;
    id: string;
    label: string;
    numeric: boolean;
}

const mapStateToProps = (state: any): any => {
    return {
        appState: selectAppState(state),
        authState: selectAuthState(state),
        adminState: selectAdminState(state)
    };
};

const mapDispatchToProps = (dispatch: Dispatch): any => ({
    fetchUsersAsAdmin: bindActionCreators(fetchUsersAsAdmin, dispatch),
    removeUser: bindActionCreators(removeUserAdmin, dispatch)
});

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        formControl: {
            margin: theme.spacing(0),
            minWidth: 120,
            backgroundColor: "white"
        },
        selectEmpty: {
            marginTop: theme.spacing(0),
        },
        backdrop: {
            zIndex: theme.zIndex.drawer + 1,
            color: '#fff',
        },
        marginBottom: {
            marginBottom: "10px"
        }
    }),
);

const Transition = React.forwardRef((
    props: TransitionProps & { children?: React.ReactElement<any, any> },
    ref: React.Ref<unknown>,
  ) => {
    return <Slide direction="up" ref={ref} {...props} />;
  });

/**
 * Function for user management on  admin dashboard 
 * 
 * @param param0 children props 
 * @returns @ReactDomElements
 * @author Kevin KIMENYI <kimenyikevin@gmail.com>
 */
const UserConsole = (props: Props) => {
    const classes = useStyles();
    const {
        adminState,
        authState,
        fetchUsersAsAdmin,
        removeUser
    } = props;
    const user = authState.get('user');


    const initialUser = {
        id: null,
        name: '',
        avatarId: ''
    };

    const headCells = {
        users: [
            { id: 'id', numeric: false, disablePadding: true, label: 'ID' },
            { id: 'name', numeric: false, disablePadding: false, label: 'Name' },
            { id: 'avatar', numeric: false, disablePadding: false, label: 'Avatar' },
            { id: 'instanceId', numeric: false, disablePadding: false, label: 'Instance' },
            { id: 'userRole', numeric: false, disablePadding: false, label: 'User Role' },
            { id: 'partyId', numeric: false, disablePadding: false, label: 'Party' },
            { id: 'action', numeric: false, disablePadding: false, label: 'Action' }
        ]
    };

    function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
        if (b[orderBy] < a[orderBy]) {
            return -1;
        }
        if (b[orderBy] > a[orderBy]) {
            return 1;
        }
        return 0;
    }
    type Order = 'asc' | 'desc';

    function getComparator<Key extends keyof any>(
        order: Order,
        orderBy: Key,
    ): (a: { [key in Key]: number | string }, b: { [key in Key]: number | string }) => number {
        return order === 'desc'
            ? (a, b) => descendingComparator(a, b, orderBy)
            : (a, b) => -descendingComparator(a, b, orderBy);
    }

    function stableSort<T>(array: T[], comparator: (a: T, b: T) => number) {
        const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
        stabilizedThis.sort((a, b) => {
            const order = comparator(a[0], b[0]);
            if (order !== 0) return order;
            return a[1] - b[1];
        });
        return stabilizedThis.map((el) => {
            return el[0];
        });
    }

    interface EnhancedTableProps {
        numSelected: number;
        onRequestSort: (event: React.MouseEvent<unknown>, property) => void;
        order: Order;
        orderBy: string;
    }

    function EnhancedTableHead(props: EnhancedTableProps) {
        const { order, orderBy, onRequestSort } = props;
        const createSortHandler = (property) => (event: React.MouseEvent<unknown>) => {
            onRequestSort(event, property);
        };

        return (
            <TableHead className={styles.thead}>
                <TableRow className={styles.trow}>
                    {headCells.users.map((headCell) => (
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
                                onClick={createSortHandler(headCell.id)}
                            >
                                {headCell.label}
                            </TableSortLabel>
                        </TableCell>
                    ))}
                </TableRow>
            </TableHead>
        );
    }

    const [userModalOpen, setUserModalOpen] = useState(false);
    const [order, setOrder] = React.useState<Order>('asc');
    const [orderBy, setOrderBy] = React.useState<any>('name');
    const [selected, setSelected] = React.useState<string[]>([]);
    const [dense, setDense] = React.useState(false);
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(PAGE_LIMIT);
    const [refetch, setRefetch] = React.useState(false);
    const [userRole, setUserRole] = React.useState("");
    const [selectedUser, setSelectedUser] = React.useState({});
    const [loading, setLoading] = React.useState(false);
    const [userEditing, setUserEditing] = React.useState(false);
    const [userEdit, setUserEdit] = React.useState(initialUser);
    const [userId, setUserId] = React.useState("");
    const [open, setOpen] = React.useState(false);

    const adminUsers = adminState.get('users').get('users');
    console.log('====================================');
    console.log(adminUsers);
    console.log('====================================');
    const handleRequestSort = (event: React.MouseEvent<unknown>, property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const fetchTick = () => {
        setTimeout(() => {
            setRefetch(true);
            fetchTick();
        }, 5000);
    };
    const patchUserRole = async (user: any, role: string) => {
        await client.service('user').patch(user, {
            userRole: role
        });
    };

    useEffect(() => {
        fetchTick();
    }, []);

    const handleUserClick = (id: string) => {
        const selected = adminUsers.find(user => user.id === id);
        setUserEdit(selected);
        setUserModalOpen(true);
        setUserEditing(true);
    };

    useEffect(() => {
        if (user?.id != null && (adminState.get('users').get('updateNeeded') === true || refetch === true)) {
            fetchUsersAsAdmin();
        }
        setRefetch(false);
    }, [authState, adminState, refetch]);

    const openModalCreate = () => {
        setUserModalOpen(true);
        setUserEditing(false);
    };

    const handleUserClose = () => {
        setUserModalOpen(false);
        setUserEditing(false);
    };

    const handleChange = (event: React.ChangeEvent<{ value: unknown }>, user: any) => {
        let role = {};
        if (user) {
            setLoading(true);
            patchUserRole(user, event.target.value as string);
            role[user] = event.target.value;
            setUserRole(event.target.value as string);
            setSelectedUser({ ...selectedUser, ...role });
            setTimeout(() => {
                setLoading(false);
            }, 2000);

        }
    };

    useEffect(() => {
        if (Object.keys(selectedUser).length === 0) {
            let role = {};
            adminUsers.forEach((element: any) => {
                role[element.id] = element.userRole;
            });
            setSelectedUser(role);
        }
    }, [adminUsers]);

    const handleClickOpen = (user: any) => {
        setUserId(user);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setUserId("");
    };

    const deleteUser = () => {
        removeUser((userId as any).id);
        handleClose();
    };

    return (
        <div>
            <Grid container spacing={3} className={classes.marginBottom}>
                <Grid item xs={9}>
                    <Search typeName="users" />
                </Grid>
                <Grid item xs={3}>
                    <Button
                        className={styles.createLocation}
                        type="submit"
                        variant="contained"
                        color="primary"
                        onClick={openModalCreate}
                    >
                        Create New User
                    </Button>
                </Grid>
            </Grid>
            <Paper className={styles.adminRoot}>
                <TableContainer className={styles.tableContainer}>
                    <Table
                        stickyHeader
                        aria-labelledby="tableTitle"
                        size={dense ? 'small' : 'medium'}
                        aria-label="enhanced table"
                    >
                        <EnhancedTableHead
                            numSelected={selected.length}
                            order={order}
                            orderBy={orderBy}
                            onRequestSort={handleRequestSort}
                        />
                        <TableBody className={styles.thead}>
                            {stableSort(adminUsers, getComparator(order, orderBy))
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((row, index) => {
                                    return (
                                        <TableRow
                                            hover
                                            className={styles.trow}
                                            style={{ color: 'black !important' }}
                                            tabIndex={-1}
                                            key={row.id}
                                        >
                                            <TableCell className={styles.tcell} component="th" id={row.id.toString()}
                                                align="right" scope="row" padding="none">
                                                {row.id}
                                            </TableCell>
                                            <TableCell className={styles.tcell} align="right">{row.name}</TableCell>
                                            <TableCell className={styles.tcell} align="right">{row.name}</TableCell>
                                            <TableCell className={(row.instanceId != null && row.instanceId !== '') ? styles.tcellSelectable : styles.tcell}
                                                align="right"
                                            >{row.instanceId}</TableCell>
                                            <TableCell className={styles.tcell} align="right">
                                                {(row.userRole === 'guest' || row.userRole === 'admin' && row.id === user.id) &&
                                                    <div>{row.userRole}</div>}
                                                {(row.userRole !== 'guest' && row.id !== user.id)
                                                    &&
                                                    <>
                                                        <p>  {row.userRole && row.userRole} </p>
                                                        <FormControl className={classes.formControl}>
                                                            <Select
                                                                value={selectedUser[row.userRole]}
                                                                onChange={(e) => handleChange(e, row.id)}
                                                                className={classes.selectEmpty}
                                                            >
                                                                <MenuItem key="user" value="user">User</MenuItem>
                                                                <MenuItem key="admin" value="admin">Admin</MenuItem>
                                                            </Select>
                                                        </FormControl>
                                                    </>
                                                }
                                            </TableCell>
                                            <TableCell className={styles.tcell} align="right">{row.partyId}</TableCell>
                                            <TableCell className={styles.tcell} align="right">
                                                <a href="#h" onClick={() => handleUserClick(row.id.toString())}> <Edit className="text-success" /> </a>
                                                <a href="#h" onClick={() => handleClickOpen(row)}> <Delete className="text-danger" /> </a>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                        </TableBody>

                    </Table>
                </TableContainer>
                <UserModel
                    open={userModalOpen}
                    handleClose={handleUserClose}
                    editing={userEditing}
                    userEdit={userEdit}
                />



                <Dialog
                    open={open}
                    TransitionComponent={Transition}
                    keepMounted
                    onClose={handleClose}
                    aria-labelledby="alert-dialog-slide-title"
                    aria-describedby="alert-dialog-slide-description"
                >
                    <DialogTitle id="alert-dialog-slide-title">{`Do You want to delete  ${(userId as any).name}?`}</DialogTitle>
                    <DialogActions>
                        <Button onClick={handleClose} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={deleteUser} color="primary">
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>
            </Paper>
            <Backdrop className={classes.backdrop} open={loading}>
                <CircularProgress color="inherit" />
            </Backdrop>
        </div>
    );

};


export default connect(mapStateToProps, mapDispatchToProps)(UserConsole);