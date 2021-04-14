---
id: "types_sctpparameters"
title: "Module: types/SctpParameters"
sidebar_label: "types/SctpParameters"
custom_edit_url: null
hide_title: true
---

# Module: types/SctpParameters

## Type aliases

### SctpParameters

Ƭ **SctpParameters**: *object*

#### Type declaration:

Name | Type | Description |
:------ | :------ | :------ |
`MIS` | *number* | Maximum number of incoming SCTP streams.   |
`OS` | *number* | Initially requested number of outgoing SCTP streams.   |
`maxMessageSize` | *number* | Maximum allowed size for SCTP messages.   |
`port` | *number* | Must always equal 5000.   |

Defined in: [packages/server-core/src/types/SctpParameters.ts:3](https://github.com/xr3ngine/xr3ngine/blob/77d12cea0/packages/server-core/src/types/SctpParameters.ts#L3)
