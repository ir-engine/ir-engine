{{/* vim: set filetype=mustache: */}}
{{/*
Expand the name of the chart.
*/}}
# {{- define "etherealengine.name" -}}
# {{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
# {{- end -}}

{{- define "etherealengine.director.name" -}}
{{- default .Chart.Name .Values.director.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "etherealengine.matchfunction.name" -}}
{{- default .Chart.Name .Values.matchfunction.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}


{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "etherealengine.matchmaking-namespace" -}}
{{- printf "%s-%s" .Values.release.name .Chart.Name | trunc 63 | trimSuffix "-" -}}
{{- end -}}

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

{{- define "etherealengine.director.fullname" -}}
{{- if .Values.director.fullnameOverride -}}
{{- .Values.director.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name .Values.director.name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}

{{- define "etherealengine.matchfunction.fullname" -}}
{{- if .Values.matchfunction.fullnameOverride -}}
{{- .Values.matchfunction.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name .Values.matchfunction.name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
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
{{- define "etherealengine.director.labels" -}}
helm.sh/chart: {{ include "etherealengine.chart" . }}
{{ include "etherealengine.director.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}

{{- define "etherealengine.matchfunction.labels" -}}
helm.sh/chart: {{ include "etherealengine.chart" . }}
{{ include "etherealengine.matchfunction.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}

{{/*
Selector labels
*/}}
{{- define "etherealengine.director.selectorLabels" -}}
app.kubernetes.io/name: {{ include "etherealengine.director.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/component: director
{{- end -}}


{{- define "etherealengine.matchfunction.selectorLabels" -}}
app.kubernetes.io/name: {{ include "etherealengine.matchfunction.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/component: matchfunction
{{- end -}}


{{/*
Create the name of the service account to use
*/}}
{{- define "etherealengine.director.serviceAccountName" -}}
{{- if .Values.director.serviceAccount.create -}}
    {{ default (include "etherealengine.director.fullname" .) .Values.director.serviceAccount.name }}
{{- else -}}
    {{ default "default" .Values.director.serviceAccount.name }}
{{- end -}}
{{- end -}}

{{- define "etherealengine.matchfunction.serviceAccountName" -}}
{{- if .Values.matchfunction.serviceAccount.create -}}
    {{ default (include "etherealengine.matchfunction.fullname" .) .Values.matchfunction.serviceAccount.name }}
{{- else -}}
    {{ default "default" .Values.matchfunction.serviceAccount.name }}
{{- end -}}
{{- end -}}
