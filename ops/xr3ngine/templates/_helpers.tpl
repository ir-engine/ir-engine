{{/* vim: set filetype=mustache: */}}
{{/*
Expand the name of the chart.
*/}}
# {{- define "xrsocial.name" -}}
# {{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
# {{- end -}}

{{- define "xrsocial.client.name" -}}
{{- default .Chart.Name .Values.client.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "xrsocial.api.name" -}}
{{- default .Chart.Name .Values.api.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "xrsocial.media.name" -}}
{{- default .Chart.Name .Values.media.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "xrsocial.spoke.name" -}}
{{- default .Chart.Name .Values.spoke.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}


{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "xrsocial.fullname" -}}
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


{{- define "xrsocial.client.fullname" -}}
{{- if .Values.client.fullnameOverride -}}
{{- .Values.client.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name .Values.client.name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}


{{- define "xrsocial.api.fullname" -}}
{{- if .Values.api.fullnameOverride -}}
{{- .Values.api.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name .Values.api.name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}


{{- define "xrsocial.media.fullname" -}}
{{- if .Values.media.fullnameOverride -}}
{{- .Values.media.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name .Values.media.name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}

{{- define "xrsocial.spoke.fullname" -}}
{{- if .Values.spoke.fullnameOverride -}}
{{- .Values.spoke.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name .Values.spoke.name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}

{{- define "xrsocial.client.host" -}}
{{- printf "%s.%s.%s" "dashboard" .Release.Name .Values.domain -}}
{{- end -}}


{{- define "xrsocial.media.host" -}}
{{- printf "%s.%s.%s" "media" .Release.Name .Values.domain -}}
{{- end -}}



{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "xrsocial.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Common labels
*/}}
{{- define "xrsocial.client.labels" -}}
helm.sh/chart: {{ include "xrsocial.chart" . }}
{{ include "xrsocial.client.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}

{{/*
Selector labels
*/}}
{{- define "xrsocial.client.selectorLabels" -}}
app.kubernetes.io/name: {{ include "xrsocial.client.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/component: client
{{- end -}}


{{/*
Common labels
*/}}
{{- define "xrsocial.api.labels" -}}
helm.sh/chart: {{ include "xrsocial.chart" . }}
{{ include "xrsocial.api.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}

{{/*
Selector labels
*/}}
{{- define "xrsocial.api.selectorLabels" -}}
app.kubernetes.io/name: {{ include "xrsocial.api.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/component: api
{{- end -}}


{{/*
Common labels
*/}}
{{- define "xrsocial.media.labels" -}}
helm.sh/chart: {{ include "xrsocial.chart" . }}
{{ include "xrsocial.media.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}

{{/*
Selector labels
*/}}
{{- define "xrsocial.media.selectorLabels" -}}
app.kubernetes.io/name: {{ include "xrsocial.media.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/component: media
{{- end -}}



{{/*
Common labels
*/}}
{{- define "xrsocial.spoke.labels" -}}
helm.sh/chart: {{ include "xrsocial.chart" . }}
{{ include "xrsocial.spoke.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}

{{/*
Selector labels
*/}}
{{- define "xrsocial.spoke.selectorLabels" -}}
app.kubernetes.io/name: {{ include "xrsocial.spoke.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/component: spoke
{{- end -}}


{{/*
Create the name of the service account to use
*/}}
{{- define "xrsocial.client.serviceAccountName" -}}
{{- if .Values.client.serviceAccount.create -}}
    {{ default (include "xrsocial.client.fullname" .) .Values.client.serviceAccount.name }}
{{- else -}}
    {{ default "default" .Values.client.serviceAccount.name }}
{{- end -}}
{{- end -}}


{{/*
Create the name of the service account to use
*/}}
{{- define "xrsocial.api.serviceAccountName" -}}
{{- if .Values.api.serviceAccount.create -}}
    {{ default (include "xrsocial.api.fullname" .) .Values.api.serviceAccount.name }}
{{- else -}}
    {{ default "default" .Values.api.serviceAccount.name }}
{{- end -}}
{{- end -}}

{{/*
Create the name of the service account to use
*/}}
{{- define "xrsocial.media.serviceAccountName" -}}
{{- if .Values.media.serviceAccount.create -}}
    {{ default (include "xrsocial.media.fullname" .) .Values.media.serviceAccount.name }}
{{- else -}}
    {{ default "default" .Values.media.serviceAccount.name }}
{{- end -}}
{{- end -}}


{{/*
Create the name of the service account to use
*/}}
{{- define "xrsocial.spoke.serviceAccountName" -}}
{{- if .Values.spoke.serviceAccount.create -}}
    {{ default (include "xrsocial.spoke.fullname" .) .Values.spoke.serviceAccount.name }}
{{- else -}}
    {{ default "default" .Values.spoke.serviceAccount.name }}
{{- end -}}
{{- end -}}


{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
*/}}
{{- define "xrsocial.mariadb.fullname" -}}
{{- if .Values.mariadb.fullnameOverride -}}
{{- .Values.mariadb.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- $name := default .Chart.Name .Values.mariadb.nameOverride -}}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}


{{/*
Set maria host
*/}}
{{- define "xrsocial.mariadb.host" -}}
{{- if .Values.mariadb.enabled -}}
{{- template "xrsocial.mariadb.fullname" . -}}
{{- else -}}
{{- .Values.mariadb.externalHost | quote -}}
{{- end -}}
{{- end -}}
