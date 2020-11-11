import React from 'react';
import { Edit, SimpleForm, TextInput, NumberInput, BooleanInput } from 'react-admin';

export const LocationEdit = props => {
    return (<Edit {...props}>
        <SimpleForm>
            <TextInput disabled source="id"/>
            <TextInput source="name"/>
            <NumberInput source="maxUsersPerInstance"/>
            <TextInput source="sceneId"/>
            <BooleanInput source="location_setting.videoEnabled" label="Enable video"/>
            <TextInput source="location_setting.locationType" label="Location Type" />
            <BooleanInput source="location_setting.instanceMediaChatEnabled" label="Enable global media chat"/>
        </SimpleForm>
    </Edit>);
};