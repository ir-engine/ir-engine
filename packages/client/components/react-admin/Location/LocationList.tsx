import React from 'react';
import { List, Datagrid, TextField, NumberField, BooleanField, ReferenceField, FunctionField } from 'react-admin';
import { BooleanNumField } from '../Fields/BoolNumField';

export const LocationList = props => {
    return (<List {...props} sort={{ field: 'name', order: 'ASC'}}>
        <Datagrid rowClick="edit">
            <TextField source="id"/>
            <TextField source="name"/>
            <NumberField source="maxUsersPerInstance"/>
            <ReferenceField reference='collection' source='sceneId' label='Scene'>
                <TextField source="name" label="Scene"/>
            </ReferenceField>
            <ReferenceField reference="location-settings" source="locationSettingsId" label="Enable Video" >
                <BooleanNumField source="videoEnabled"/>
            </ReferenceField>
            <ReferenceField reference='location-settings' source='locationSettingsId' label='Location Type'>
                <TextField source="locationType"/>
            </ReferenceField>
            <ReferenceField reference='location-settings' source='locationSettingsId' label='Enable Global Media Chat'>
                <BooleanNumField source="instanceMediaChatEnabled"/>
            </ReferenceField>
        </Datagrid>
    </List>);
};