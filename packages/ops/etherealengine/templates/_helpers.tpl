{{/* vim: set filetype=mustache: */}}
{{/*
Expand the name of the chart.
*/}}
# {{- define "etherealengine.name" -}}
# {{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
# {{- end -}}

{{- define "etherealengine.taskserver.name" -}}
{{- default .Chart.Name .Values.taskserver.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "etherealengine.client.name" -}}
{{- default .Chart.Name .Values.client.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "etherealengine.api.name" -}}
{{- default .Chart.Name .Values.api.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "etherealengine.media.name" -}}
{{- default .Chart.Name .Values.media.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "etherealengine.instanceserver.name" -}}
{{- default .Chart.Name .Values.instanceserver.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "etherealengine.testbot.name" -}}
{{- default .Chart.Name (.Values.testbot).nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}


{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "etherealengine.fullname" -}}
{{- if .Values.fullnameOverride -}}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- $name := default .Chart.Name .Values.nameOverride -}}
{{- if contains $name .Release.Name -}}
{{- .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}
{{- end -}}


{{- define "etherealengine.taskserver.fullname" -}}
{{- if .Values.taskserver.fullnameOverride -}}
{{- .Values.taskserver.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name .Values.taskserver.name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}


{{- define "etherealengine.client.fullname" -}}
{{- if .Values.client.fullnameOverride -}}
{{- .Values.client.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name .Values.client.name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}


{{- define "etherealengine.api.fullname" -}}
{{- if .Values.api.fullnameOverride -}}
{{- .Values.api.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name .Values.api.name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}


{{- define "etherealengine.media.fullname" -}}
{{- if .Values.media.fullnameOverride -}}
{{- .Values.media.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name .Values.media.name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}

{{- define "etherealengine.instanceserver.fullname" -}}
{{- if .Values.instanceserver.fullnameOverride -}}
{{- .Values.instanceserver.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name .Values.instanceserver.name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}


{{- define "etherealengine.testbot.fullname" -}}
{{- if (.Values.testbot).fullnameOverride -}}
{{- .Values.testbot.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name (.Values.testbot).name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}

{{- define "etherealengine.client.host" -}}
{{- printf "%s.%s.%s" "dashboard" .Release.Name .Values.domain -}}
{{- end -}}


{{- define "etherealengine.media.host" -}}
{{- printf "%s.%s.%s" "media" .Release.Name .Values.domain -}}
{{- end -}}



{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "etherealengine.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Common labels
*/}}
{{- define "etherealengine.taskserver.labels" -}}
helm.sh/chart: {{ include "etherealengine.chart" . }}
{{ include "etherealengine.taskserver.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}

{{/*
Selector labels
*/}}
{{- define "etherealengine.taskserver.selectorLabels" -}}
app.kubernetes.io/name: {{ include "etherealengine.taskserver.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/component: taskserver
{{- end -}}

{{/*
Common labels
*/}}
{{- define "etherealengine.client.labels" -}}
helm.sh/chart: {{ include "etherealengine.chart" . }}
{{ include "etherealengine.client.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}

{{/*
Selector labels
*/}}
{{- define "etherealengine.client.selectorLabels" -}}
app.kubernetes.io/name: {{ include "etherealengine.client.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/component: client
{{- end -}}


{{/*
Common labels
*/}}
{{- define "etherealengine.api.labels" -}}
helm.sh/chart: {{ include "etherealengine.chart" . }}
{{ include "etherealengine.api.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}

{{/*
Selector labels
*/}}
{{- define "etherealengine.api.selectorLabels" -}}
app.kubernetes.io/name: {{ include "etherealengine.api.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/component: api
{{- end -}}


{{/*
Common labels
*/}}
{{- define "etherealengine.media.labels" -}}
helm.sh/chart: {{ include "etherealengine.chart" . }}
{{ include "etherealengine.media.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}

{{/*
Selector labels
*/}}
{{- define "etherealengine.media.selectorLabels" -}}
app.kubernetes.io/name: {{ include "etherealengine.media.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/component: media
{{- end -}}

{{/*
Common labels
*/}}
{{- define "etherealengine.instanceserver.labels" -}}
helm.sh/chart: {{ include "etherealengine.chart" . }}
{{ include "etherealengine.instanceserver.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}

{{/*
Selector labels
*/}}
{{- define "etherealengine.instanceserver.selectorLabels" -}}
app.kubernetes.io/name: {{ include "etherealengine.instanceserver.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/component: instanceserver
{{- end -}}


{{/*
Common labels
*/}}
{{- define "etherealengine.testbot.labels" -}}
helm.sh/chart: {{ include "etherealengine.chart" . }}
{{ include "etherealengine.testbot.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}

{{/*
Selector labels
*/}}
{{- define "etherealengine.testbot.selectorLabels" -}}
app.kubernetes.io/name: {{ include "etherealengine.testbot.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/component: testbot
{{- end -}}


{{/*
Create the name of the service account to use
*/}}
{{- define "etherealengine.taskserver.serviceAccountName" -}}
{{- if .Values.taskserver.serviceAccount.create -}}
    {{ default (include "etherealengine.taskserver.fullname" .) .Values.taskserver.serviceAccount.name }}
{{- else -}}
    {{ default "default" .Values.taskserver.serviceAccount.name }}
{{- end -}}
{{- end -}}


{{/*
Create the name of the service account to use
*/}}
{{- define "etherealengine.client.serviceAccountName" -}}
{{- if .Values.client.serviceAccount.create -}}
    {{ default (include "etherealengine.client.fullname" .) .Values.client.serviceAccount.name }}
{{- else -}}
    {{ default "default" .Values.client.serviceAccount.name }}
{{- end -}}
{{- end -}}


{{/*
Create the name of the service account to use
*/}}
{{- define "etherealengine.api.serviceAccountName" -}}
{{- if .Values.api.serviceAccount.create -}}
    {{ default (include "etherealengine.api.fullname" .) .Values.api.serviceAccount.name }}
{{- else -}}
    {{ default "default" .Values.api.serviceAccount.name }}
{{- end -}}
{{- end -}}

{{/*
Create the name of the service account to use
*/}}
{{- define "etherealengine.media.serviceAccountName" -}}
{{- if .Values.media.serviceAccount.create -}}
    {{ default (include "etherealengine.media.fullname" .) .Values.media.serviceAccount.name }}
{{- else -}}
    {{ default "default" .Values.media.serviceAccount.name }}
{{- end -}}
{{- end -}}

{{/*
Create the name of the service account to use
*/}}
{{- define "etherealengine.instanceserver.serviceAccountName" -}}
{{- if .Values.instanceserver.serviceAccount.create -}}
    {{ default (include "etherealengine.instanceserver.fullname" .) .Values.instanceserver.serviceAccount.name }}
{{- else -}}
    {{ default "default" .Values.instanceserver.serviceAccount.name }}
{{- end -}}
{{- end -}}


{{/*
Create the name of the service account to use
*/}}
{{- define "etherealengine.testbot.serviceAccountName" -}}
{{- if ((.Values.testbot).serviceAccount).create -}}
    {{ default (include "etherealengine.testbot.fullname" .) .Values.testbot.serviceAccount.name }}
{{- else -}}
    {{ default "default" ((.Values.testbot).serviceAccount).name }}
{{- end -}}
{{- end -}}


{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
*/}}
{{- define "etherealengine.mariadb.fullname" -}}
{{- if ((.Values.mariadb).fullnameOverride) -}}
{{- .Values.mariadb.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- $name := default .Chart.Name .Values.mariadb.nameOverride -}}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}


{{/*
Set maria host
*/}}
{{- define "etherealengine.mariadb.host" -}}
{{- if ((.Values.mariadb).enabled) -}}
{{- template "etherealengine.mariadb.fullname" . -}}
{{- else if ((.Values.mariadb).externalHost) -}}
{{- .Values.mariadb.externalHost | quote -}}
{{- end -}}
{{- end -}}
