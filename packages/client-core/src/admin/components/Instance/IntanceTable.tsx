import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import { selectAuthState } from '../../../user/reducers/auth/selector';
import { selectAdminState } from '../../reducers/admin/selector';
import { fetchAdminInstances, removeInstance } from '../../reducers/admin/service';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';



interface Column {
    id: 'ipAddress' | 'currentUsers' | 'locationId' | 'groupId' | 'channelId' | 'action';
    label: string;
    minWidth?: number;
    align?: 'right';
}

const columns: Column[] = [
    { id: 'ipAddress', label: 'Ip Address', minWidth: 170 },
    { id: 'currentUsers', label: 'Current Users', minWidth: 100 },
    {
        id: 'locationId',
        label: 'Location',
        minWidth: 170,
        align: 'right',
    },
    {
        id: 'groupId',
        label: 'Group',
        minWidth: 170,
        align: 'right',
    },
    {
        id: 'channelId',
        label: "Channel",
        minWidth: 170,
        align: 'right'
    },
    {
        id: 'action',
        label: 'Action',
        minWidth: 170,
        align: 'right',
    },
];

interface Data {
    ipAddress: string;
    currentUsers: string;
    locationId: string;
    groupId: string;
    channelId: string,
    action: any
}

interface Props {
    adminState?: any;
    authState?: any;
    fetchAdminState?: any;
    fetchAdminInstances?: any
}

const mapStateToProps = ( state: any ): any => {
    return {
        authState: selectAuthState(state),
        adminState: selectAdminState(state)
    }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
    fetchAdminInstances: bindActionCreators(fetchAdminInstances, dispatch)
})

const useStyles = makeStyles({
    root: {
        width: '100%',
    },
    container: {
        maxHeight: "80vh",
    },
    actionStyle: {
        textDecoration: "none",
        color: "#000",
        marginRight: "10px"
    }
});

const IntanceTable = (props: Props) => {
    const { fetchAdminInstances, adminState, authState } = props;
    const classes = useStyles();
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);

    const user = authState.get("user");
    const adminInstances = adminState.get('instances');

    console.log('====================================');
    console.log(adminInstances);
    console.log('====================================');
    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    React.useEffect(()=> {
        if(user.id && adminInstances.get("updateNeeded")){
            fetchAdminInstances()
        }
    }, [user, adminState]);



    return (
        <div className={classes.root}>
            <TableContainer className={classes.container}>
                <Table stickyHeader aria-label="sticky table">
                    <TableHead>
                        <TableRow>
                            {columns.map((column) => (
                                <TableCell
                                    key={column.id}
                                    align={column.align}
                                    style={{ minWidth: column.minWidth }}
                                >
                                    {column.label}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {/* {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                            return (
                                <TableRow hover role="checkbox" tabIndex={-1} key={row.name}>
                                    {columns.map((column) => {
                                        const value = row[column.id];
                                        return (
                                            <TableCell key={column.id} align={column.align}>
                                                {value}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            );
                        })} */}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[10, 25, 100]}
                component="div"
                count={10}
                rowsPerPage={rowsPerPage}
                page={page}
                onChangePage={handleChangePage}
                onChangeRowsPerPage={handleChangeRowsPerPage}
            />
        </div>
    )
}


export default connect(mapStateToProps, mapDispatchToProps)(IntanceTable); 