---
id: "components_terminal_args_utils"
title: "Module: components/terminal/args/utils"
sidebar_label: "components/terminal/args/utils"
custom_edit_url: null
hide_title: true
---

# Module: components/terminal/args/utils

## Properties

### default

• **default**: *object*

#### Type declaration:

Name | Type |
:------ | :------ |
`generateDetails` | (`kind`: *any*) => *any*[] |
`generateExamples` | () => *any*[] |
`getOptions` | (`definedSubcommand`: *any*) => {} |
`handleType` | (`value`: *any*) => (*string* \| (`s`: *string*, `radix?`: *number*) => *number*)[] |
`isDefined` | (`name`: *any*, `list`: *any*) => *any* |
`readOption` | (`option`: *any*) => {} |
`runCommand` | (`details`: *any*, `options`: *any*) => *any* |
