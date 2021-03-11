import getConfig from 'next/config';
import React, { useEffect, useState } from 'react';
import Search from "./Search";
import { PAGE_LIMIT } from '../../../redux/admin/reducers';
import {
    Table,
    TableBody,
    TableContainer,
    TableHead,
    TableRow,
    TableCell,
    TableSortLabel,
    Paper,
    Button, 
} from '@material-ui/core';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { selectAdminState } from '../../../redux/admin/selector';
import { selectAppState } from '../../../redux/app/selector';
import { selectAuthState } from '../../../redux/auth/selector';
import styles from './Admin.module.scss';
import { Router, withRouter } from "next/router";
import {
    fetchAdminInstances
} from '../../../redux/admin/service';
import InstanceModal from './InstanceModal';
import CreateInstance from "./CreateInstance";

if (!global.setImmediate) {
    global.setImmediate = setTimeout as any;
}

const { publicRuntimeConfig } = getConfig();

interface Props {
    router?: Router;
    adminState?: any;
    authState?: any;
    locationState?: any;
    fetchAdminInstances?: any;
}

const mapStateToProps = (state: any): any => {
    return {
        appState: selectAppState(state),
        authState: selectAuthState(state),
        adminState: selectAdminState(state)
    };
};

const mapDispatchToProps = (dispatch: Dispatch): any => ({
    fetchAdminInstances: bindActionCreators(fetchAdminInstances, dispatch)
});

function InstanceConsole(props: Props) {
    const {
        router,
        adminState,
        authState,
        fetchAdminInstances
    } = props;
    const initialInstance = {
        id: '',
        ipAddress: '',
        currentUsers: 0,
        locationId: ''
    };
    const user = authState.get('user');
    const [selectedInstance, setSelectedInstance] = useState(initialInstance);
    const [instanceCreateOpen, setInstanceCreateOpen] = useState(false);
    const [instanceModalOpen, setInstanceModalOpen] = useState(false);
    const adminInstances = adminState.get('instances').get('instances');

    const headCells = {
        instances: [
            { id: 'id', numeric: false, disablePadding: true, label: 'ID' },
            { id: 'ipAddress', numeric: false, disablePadding: false, label: 'IP address' },
            { id: 'gsId', numeric: false, disablePadding: false, label: 'Gameserver ID' },
            { id: 'serverAddress', numeric: false, disablePadding: false, label: 'Public address' },
            { id: 'currentUsers', numeric: true, disablePadding: false, label: 'Current # of Users' },
            { id: 'locationId', numeric: false, disablePadding: false, label: 'Location ID' }
        ]
    };

    const openModalCreate = () => {
        setInstanceCreateOpen(true);
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
        return stabilizedThis.map((el) => el[0]);
    }



    interface EnhancedTableProps {
        object: string,
        numSelected: number;
        onRequestSort: (event: React.MouseEvent<unknown>, property) => void;
        onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
        order: Order;
        orderBy: string;
        rowCount: number;
    }

    function EnhancedTableHead(props: EnhancedTableProps) {
        const { object, order, orderBy, onRequestSort } = props;
        const createSortHandler = (property) => (event: React.MouseEvent<unknown>) => {
            onRequestSort(event, property);
        };

        return (
            <TableHead className={styles.thead}>
                <TableRow className={styles.trow}>
                    {headCells.instances.map((headCell) => (
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


    const [order, setOrder] = React.useState<Order>('asc');
    const [orderBy, setOrderBy] = React.useState<any>('name');
    const [selected, setSelected] = React.useState<string[]>([]);
    const [page, setPage] = React.useState(0);
    const [dense, setDense] = React.useState(false);
    const [rowsPerPage, setRowsPerPage] = React.useState(PAGE_LIMIT);
    const [refetch, setRefetch] = React.useState(false);


    const displayInstances = adminInstances.map(instance => {
        return {
            id: instance.id,
            ipAddress: instance.ipAddress,
            currentUsers: instance.currentUsers,
            locationId: instance.locationId,
            gsId: instance.gameserver_subdomain_provision?.gs_id,
            serverAddress: instance.gameserver_subdomain_provision != null ? `https://${instance.gameserver_subdomain_provision.gs_number}.${publicRuntimeConfig.gameserverDomain}` : ''
        };
    });
    const handleRequestSort = (event: React.MouseEvent<unknown>, property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleInstanceClick = (event: React.MouseEvent<unknown>, id: string) => {
        const selected = adminInstances.find(instance => instance.id === id);
        setSelectedInstance(selected);
        setInstanceModalOpen(true);
    };

    const handleInstanceClose = (e: any): void => {
        console.log('handleInstanceClosed');
        setInstanceModalOpen(false);
        setSelectedInstance(initialInstance);
    };

    const handleCreateInstanceClose = (e: any): void => {
        setInstanceCreateOpen(false);
    };

    useEffect(() => {
        if (user?.id != null && (adminState.get('instances').get('updateNeeded') === true || refetch === true)) {
            fetchAdminInstances();
        }
        setRefetch(false);
    }, [authState, adminState, refetch]);

    return (
        <div>
            <div className="row mb-5">
                <div className="col-lg-9">
                    <Search typeName="users" />
                </div>
                <div className="col-lg-3">
                    <Button
                        className={styles.createLocation}
                        type="submit"
                        variant="contained"
                        color="primary"
                        onClick={openModalCreate}
                    >
                        Create New Instance
                    </Button>
                </div>
            </div>

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
                            {stableSort(displayInstances, getComparator(order, orderBy))
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((row, index) => {
                                    return (
                                        <TableRow
                                            className={styles.trow}
                                            style={{ color: 'black !important' }}
                                            // onClick={(event) => handleClick(event, row.id.toString())}
                                            tabIndex={-1}
                                            key={row.id}
                                        >
                                            <TableCell className={styles.tcell} component="th" id={row.id.toString()}
                                                align="right" scope="row" padding="none">
                                                {row.id}
                                            </TableCell>
                                            <TableCell className={styles.tcell} align="right">{row.ipAddress}</TableCell>
                                            <TableCell className={styles.tcell}
                                                align="right">
                                                {row.gsId}
                                            </TableCell>
                                            <TableCell className={styles.tcell}
                                                align="right">
                                                {row.serverAddress}
                                            </TableCell>
                                            <TableCell className={styles.tcellSelectable}
                                                align="center"
                                                onClick={(event) => handleInstanceClick(event, row.id.toString())}
                                            >
                                                <p className={styles.currentUser}>{row.currentUsers}</p></TableCell>
                                            <TableCell className={styles.tcell}
                                                align="right">{row.locationId}</TableCell>
                                        </TableRow>
                                    );
                                })}
                        </TableBody>

                    </Table>
                </TableContainer>
                <InstanceModal
                    instance={selectedInstance}
                    open={instanceModalOpen}
                    handleClose={handleInstanceClose}
                />
                <CreateInstance
                    open={instanceCreateOpen}
                    handleClose={handleCreateInstanceClose}
                />
            </Paper>
        </div>
    )
}


export default withRouter(connect(mapStateToProps, mapDispatchToProps)(InstanceConsole));