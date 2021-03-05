import getConfig from 'next/config';
import {
    Button, MenuItem, Select,
    Tab,
    Tabs
} from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { selectAdminState } from '../../../redux/admin/selector';
import { selectAppState } from '../../../redux/app/selector';
import { selectAuthState } from '../../../redux/auth/selector';
import { client } from "../../../redux/feathers";
import { Router, withRouter } from "next/router";
import { PAGE_LIMIT } from '../../../redux/admin/reducers';
import {
    fetchAdminLocations,
    fetchAdminScenes,
    fetchLocationTypes,
    fetchUsersAsAdmin,
    fetchAdminInstances
} from '../../../redux/admin/service';
import {
    Table,
    TableBody,
    TableContainer,
    TableHead,
    TableRow,
    TableCell,
    TableSortLabel,
    Paper,
    TablePagination
} from '@material-ui/core';
import styles from './Admin.module.scss';
import LocationModal from './LocationModal';
import InstanceModal from './InstanceModal';

if (!global.setImmediate) {
    global.setImmediate = setTimeout as any;
}

const { publicRuntimeConfig } = getConfig();

interface Props {
    router: Router;
    adminState?: any;
    authState?: any;
    locationState?: any;
    fetchAdminLocations?: any;
    fetchAdminScenes?: any;
    fetchLocationTypes?: any;
    fetchUsersAsAdmin?: any;
    fetchAdminInstances?: any;
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
    fetchAdminLocations: bindActionCreators(fetchAdminLocations, dispatch),
    fetchAdminScenes: bindActionCreators(fetchAdminScenes, dispatch),
    fetchLocationTypes: bindActionCreators(fetchLocationTypes, dispatch),
    fetchUsersAsAdmin: bindActionCreators(fetchUsersAsAdmin, dispatch),
    fetchAdminInstances: bindActionCreators(fetchAdminInstances, dispatch)
});

const AdminConsole = (props: Props) => {
    const {
        router,
        adminState,
        authState,
        fetchAdminLocations,
        fetchAdminScenes,
        fetchLocationTypes,
        fetchUsersAsAdmin,
        fetchAdminInstances
    } = props;

    const initialLocation = {
        id: null,
        name: '',
        maxUsersPerInstance: 10,
        sceneId: null,
        locationSettingsId: null,
        location_setting: {
            instanceMediaChatEnabled: false,
            videoEnabled: false,
            locationType: 'private'
        }
    };


    

    const initialInstance = {
        id: '',
        ipAddress: '',
        currentUsers: 0,
        locationId: ''
    };

    const user = authState.get('user');
    const [locationModalOpen, setLocationModalOpen] = useState(false);
    const [instanceModalOpen, setInstanceModalOpen] = useState(false);
    const [locationEditing, setLocationEditing] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState(initialLocation);
    const [selectedInstance, setSelectedInstance] = useState(initialInstance);
    const adminScenes = adminState.get('scenes').get('scenes');
     
    const headCells = {
        locations: [
            {id: 'id', numeric: false, disablePadding: true, label: 'ID'},
            {id: 'name', numeric: false, disablePadding: false, label: 'Name'},
            {id: 'sceneId', numeric: false, disablePadding: false, label: 'Scene'},
            {id: 'maxUsersPerInstance', numeric: true, disablePadding: false, label: 'Max Users'},
            {id: 'type', numeric: false, disablePadding: false, label: 'Type'},
            {id: 'instanceMediaChatEnabled', numeric: false, disablePadding: false, label: 'Enable public media chat'},
            {id: 'videoEnabled', numeric: false, disablePadding: false, label: 'Video Enabled'}
        ],
        users: [
            {id: 'id', numeric: false, disablePadding: true, label: 'ID'},
            {id: 'name', numeric: false, disablePadding: false, label: 'Name'},
            {id: 'instanceId', numeric: false, disablePadding: false, label: 'Instance ID'},
            {id: 'userRole', numeric: false, disablePadding: false, label: 'User Role'},
            {id: 'partyId', numeric: false, disablePadding: false, label: 'Party ID'}
        ],
        instances: [
            {id: 'id', numeric: false, disablePadding: true, label: 'ID'},
            {id: 'ipAddress', numeric: false, disablePadding: false, label: 'IP address'},
            {id: 'gsId', numeric: false, disablePadding: false, label: 'Gameserver ID'},
            {id: 'serverAddress', numeric: false, disablePadding: false, label: 'Public address'},
            {id: 'currentUsers', numeric: true, disablePadding: false, label: 'Current # of Users'},
            {id: 'locationId', numeric: false, disablePadding: false, label: 'Location ID'}
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

    const getScene = (id: string): string => {
        const sceneMatch = adminScenes.find(scene => scene.sid === id);
        return sceneMatch != null ? `${sceneMatch.name} (${sceneMatch.sid})` : '';
    };

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

    interface Data {
        locations: {
            id: string,
            name: string,
            sceneId: string,
            maxUsersPerInstance: number,
            type: string,
            instanceMediaChatEnabled: boolean,
            videoEnabled: boolean
        },
        users: {
            id: string,
            name: string,
            instanceId: string,
            userRole: string,
            partyId: string
        }
    }

    interface HeadCell {
        disablePadding: boolean;
        id: string;
        label: string;
        numeric: boolean;
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
        const {object, order, orderBy, onRequestSort} = props;
        const createSortHandler = (property) => (event: React.MouseEvent<unknown>) => {
            onRequestSort(event, property);
        };

        return (
            <TableHead className={styles.thead}>
                <TableRow className={styles.trow}>
                    {headCells[object].map((headCell) => (
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
    const [selectedTab, setSelectedTab] = React.useState('locations');
    const [refetch, setRefetch] = React.useState(false);

    const adminLocations = adminState.get('locations').get('locations');
    const adminLocationCount = adminState.get('locations').get('total');
    const adminUsers = adminState.get('users').get('users');
    const adminUserCount = adminState.get('users').get('total');
    const adminInstances = adminState.get('instances').get('instances');
    const adminInstanceCount = adminState.get('instances').get('total');

    
    const selectCount = selectedTab === 'locations' ? adminLocationCount : selectedTab === 'users' ? adminUserCount : selectedTab === 'instances' ? adminInstanceCount : 0;
    const displayLocations = adminLocations.map(location => {
        return {
            id: location.id,
            name: location.name,
            sceneId: location.sceneId,
            maxUsersPerInstance: location.maxUsersPerInstance,
            type: location.location_setting.locationType,
            instanceMediaChatEnabled: location.location_setting.instanceMediaChatEnabled.toString(),
            videoEnabled: location.location_setting.videoEnabled.toString()
        };
    });



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

    const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            const newSelecteds = adminLocations.map((n) => n.name);
            setSelected(newSelecteds);
            return;
        }
        setSelected([]);
    };

    const handleLocationClick = (event: React.MouseEvent<unknown>, id: string) => {
        const selected = adminLocations.find(location => location.id === id);
        setSelectedLocation(selected);
        setLocationEditing(true);
        setLocationModalOpen(true);
    };

    const openModalCreate = () => {
        setSelectedLocation(initialLocation);
        setLocationEditing(false);
        setLocationModalOpen(true);
    };

    const handleInstanceClick = (event: React.MouseEvent<unknown>, id: string) => {
        const selected = adminInstances.find(instance => instance.id === id);
        setSelectedInstance(selected);
        setInstanceModalOpen(true);
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        const incDec = page < newPage ? 'increment' : 'decrement';
        switch (selectedTab) {
            case 'locations':
                fetchAdminLocations(incDec);
                break;
            case 'users':
                fetchUsersAsAdmin(incDec);
                break;
            case 'instances':
                fetchAdminInstances(incDec);
                break;
        }
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleLocationClose = (e: any): void => {
        setLocationEditing(false);
        setLocationModalOpen(false);
        setSelectedLocation(initialLocation);
    };

    const handleInstanceClose = (e: any): void => {
        console.log('handleInstanceClosed');
        setInstanceModalOpen(false);
        setSelectedInstance(initialInstance);
    };

    const handleTabChange = (e: any, newValue: string) => {
        setSelectedTab(newValue);
    };

    const redirectToInstance = async (e: any, instanceId: string) => {
        try {
            const instance = await client.service('instance').get(instanceId);
            const location = await client.service('location').get(instance.locationId);
            const route = `/location/${location.slugifiedName}?instanceId=${instance.id}`;
            router.push(route);
        } catch (err) {
            console.log('Error redirecting to instance:');
            console.log(err);
        }
    };

    const fetchTick = () => {
        setTimeout(() => {
            setRefetch(true);
            fetchTick();
        }, 5000);
    };

    const patchUserRole = async (e: any, user: any, role: string) => {
        await client.service('user').patch(user.id, {
            userRole: role
        });
    };

    useEffect(() => {
        fetchTick();
    }, []);

    useEffect(() => {
        if (user?.id != null && (adminState.get('locations').get('updateNeeded') === true || refetch === true)) {
            fetchAdminLocations();
        }
        if (user?.id != null && (adminState.get('scenes').get('updateNeeded') === true || refetch === true)) {
            fetchAdminScenes();
        }
        if (user?.id != null && adminState.get('locationTypes').get('updateNeeded') === true) {
            fetchLocationTypes();
        }
        if (user?.id != null && (adminState.get('users').get('updateNeeded') === true || refetch === true)) {
            fetchUsersAsAdmin();
        }
        if (user?.id != null && (adminState.get('instances').get('updateNeeded') === true || refetch === true)) {
            fetchAdminInstances();
        }
        setRefetch(false);
    }, [authState, adminState, refetch]);
   

    return (
        <Paper className={styles.adminRoot}>
            <Tabs value={selectedTab} onChange={handleTabChange} aria-label="tabs">
                <Tab label="Locations" value="locations"/>
                {user?.userRole === 'admin' && <Tab label="Users" value="users"/>}
                {user?.userRole === 'admin' && <Tab label="Instances" value="instances"/>}
            </Tabs>
            <TableContainer className={styles.tableContainer}>
                <Table
                    stickyHeader
                    aria-labelledby="tableTitle"
                    size={dense ? 'small' : 'medium'}
                    aria-label="enhanced table"
                >
                    <EnhancedTableHead
                        object={selectedTab}
                        numSelected={selected.length}
                        order={order}
                        orderBy={orderBy}
                        onSelectAllClick={handleSelectAllClick}
                        onRequestSort={handleRequestSort}
                        rowCount={adminLocationCount || 0}
                    />
                    {selectedTab === 'locations' && <TableBody className={styles.thead}>
                        {stableSort(displayLocations, getComparator(order, orderBy))
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((row, index) => {
                                return (
                                    <TableRow
                                        hover
                                        className={styles.trowHover}
                                        style={{color: 'black !important'}}
                                        onClick={(event) => handleLocationClick(event, row.id.toString())}
                                        tabIndex={-1}
                                        key={row.id}
                                    >
                                        <TableCell className={styles.tcell} component="th" id={row.id.toString()}
                                                   align="right" scope="row" padding="none">
                                            {row.id}
                                        </TableCell>
                                        <TableCell className={styles.tcell} align="right">{row.name}</TableCell>
                                        <TableCell className={styles.tcell}
                                                   align="right">{getScene(row.sceneId as string)}</TableCell>
                                        <TableCell className={styles.tcell}
                                                   align="right">{row.maxUsersPerInstance}</TableCell>
                                        <TableCell className={styles.tcell} align="right">{row.type}</TableCell>
                                        <TableCell className={styles.tcell} align="right">{row.videoEnabled}</TableCell>
                                        <TableCell className={styles.tcell}
                                                   align="right">{row.instanceMediaChatEnabled}</TableCell>
                                    </TableRow>
                                );
                            })}
                    </TableBody>
                    }
                    {selectedTab === 'users' && <TableBody className={styles.thead}>
                        {stableSort(adminUsers, getComparator(order, orderBy))
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
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
                                        <TableCell className={(row.instanceId != null && row.instanceId !== '') ? styles.tcellSelectable : styles.tcell}
                                                   align="right"
                                                   onClick={(event) => (row.instanceId != null && row.instancedId !== '') ? redirectToInstance(event, row.instanceId.toString()) : {}}
                                        >{row.instanceId}</TableCell>
                                        <TableCell className={styles.tcell} align="right">
                                            {(row.userRole === 'guest' || row.userRole === 'admin' && row.id === user.id) &&
                                            <div>{row.userRole}</div>}
                                            {(row.userRole !== 'guest' && row.id !== user.id) && <Select
                                                labelId="userRole"
                                                id="userRole"
                                                value={row.userRole}
                                                onChange={(e) => patchUserRole(e, row, e.target.value as string)}
                                            >
                                                <MenuItem key='user' value='user'>User</MenuItem>)
                                                <MenuItem key='admin' value='admin'>Admin</MenuItem>
                                            </Select>}
                                        </TableCell>
                                        <TableCell className={styles.tcell} align="right">{row.partyId}</TableCell>
                                    </TableRow>
                                );
                            })}
                    </TableBody>
                    }
                    {selectedTab === 'instances' && <TableBody className={styles.thead}>
                        {stableSort(displayInstances, getComparator(order, orderBy))
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
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
                                                   align="right"
                                                   onClick={(event) => handleInstanceClick(event, row.id.toString())}
                                        >{row.currentUsers}</TableCell>
                                        <TableCell className={styles.tcell}
                                                   align="right">{row.locationId}</TableCell>
                                    </TableRow>
                                );
                            })}
                    </TableBody>
                    }
                </Table>
            </TableContainer>
            <div className={styles.tableFooter}>
                {selectedTab === 'locations' && <Button
                    className={styles.createLocation}
                    type="submit"
                    variant="contained"
                    color="primary"
                    onClick={openModalCreate}
                >
                    Create New Location
                </Button>
                }
                {selectedTab !== 'locations' && <div/>}
                <TablePagination
                    rowsPerPageOptions={[PAGE_LIMIT]}
                    component="div"
                    count={selectCount}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onChangePage={handleChangePage}
                    onChangeRowsPerPage={handleChangeRowsPerPage}
                    className={styles.tablePagination}
                />
            </div>
            <LocationModal
                editing={locationEditing}
                location={selectedLocation}
                open={locationModalOpen}
                handleClose={handleLocationClose}
            />
            <InstanceModal
                instance={selectedInstance}
                open={instanceModalOpen}
                handleClose={handleInstanceClose}
            />
        </Paper>
    );
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(AdminConsole));
