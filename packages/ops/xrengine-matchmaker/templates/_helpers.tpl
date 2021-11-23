{{/* vim: set filetype=mustache: */}}
{{/*
Expand the name of the chart.
*/}}
# {{- define "xrengine.name" -}}
# {{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
# {{- end -}}

{{- define "xrengine.director.name" -}}
{{- default .Chart.Name .Values.director.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "xrengine.frontend.name" -}}
{{- default .Chart.Name .Values.frontend.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "xrengine.matchfunction.name" -}}
{{- default .Chart.Name .Values.matchfunction.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}


{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "xrengine.fullname" -}}
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

{{- define "xrengine.director.fullname" -}}
{{- if .Values.director.fullnameOverride -}}
{{- .Values.director.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name .Values.director.name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}

{{- define "xrengine.frontend.fullname" -}}
{{- if .Values.frontend.fullnameOverride -}}
{{- .Values.frontend.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name .Values.frontend.name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}

{{- define "xrengine.matchfunction.fullname" -}}
{{- if .Values.matchfunction.fullnameOverride -}}
{{- .Values.matchfunction.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name .Values.matchfunction.name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}


{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "xrengine.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Common labels
*/}}
{{- define "xrengine.director.labels" -}}
helm.sh/chart: {{ include "xrengine.chart" . }}
{{ include "xrengine.director.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}

{{- define "xrengine.frontend.labels" -}}
helm.sh/chart: {{ include "xrengine.chart" . }}
{{ include "xrengine.frontend.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}

{{- define "xrengine.matchfunction.labels" -}}
helm.sh/chart: {{ include "xrengine.chart" . }}
{{ include "xrengine.matchfunction.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}

{{/*
Selector labels
*/}}
{{- define "xrengine.director.selectorLabels" -}}
app.kubernetes.io/name: {{ include "xrengine.director.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/component: director
{{- end -}}

{{- define "xrengine.frontend.selectorLabels" -}}
app.kubernetes.io/name: {{ include "xrengine.frontend.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/component: frontend
{{- end -}}


{{- define "xrengine.matchfunction.selectorLabels" -}}
app.kubernetes.io/name: {{ include "xrengine.matchfunction.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/component: matchfunction
{{- end -}}


{{/*
Create the name of the service account to use
*/}}
{{- define "xrengine.director.serviceAccountName" -}}
{{- if .Values.director.serviceAccount.create -}}
    {{ default (include "xrengine.director.fullname" .) .Values.director.serviceAccount.name }}
{{- else -}}
    {{ default "default" .Values.director.serviceAccount.name }}
{{- end -}}
{{- end -}}

{{- define "xrengine.frontend.serviceAccountName" -}}
{{- if .Values.frontend.serviceAccount.create -}}
    {{ default (include "xrengine.frontend.fullname" .) .Values.frontend.serviceAccount.name }}
{{- else -}}
    {{ default "default" .Values.frontend.serviceAccount.name }}
{{- end -}}
{{- end -}}

{{- define "xrengine.matchfunction.serviceAccountName" -}}
{{- if .Values.matchfunction.serviceAccount.create -}}
    {{ default (include "xrengine.matchfunction.fullname" .) .Values.matchfunction.serviceAccount.name }}
{{- else -}}
    {{ default "default" .Values.matchfunction.serviceAccount.name }}
{{- end -}}
{{- end -}}
