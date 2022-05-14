{{/* Returns the cluster secret name */}}
{{- define "ipfs-cluster.secretName" -}}
{{ .Release.Name }}
{{- end }}

{{/* Returns the configmap env name */}}
{{- define "ipfs-cluster.configmapEnvName" -}}
{{ .Release.Name }}-env
{{- end }}

{{/* Returns the configmap bootstrap name */}}
{{- define "ipfs-cluster.configmapBootstrapName" -}}
{{ .Release.Name }}-bootstrap
{{- end }}

{{/* Returns the statefulset name */}}
{{- define "ipfs-cluster.statefulsetName" -}}
{{ .Release.Name }}
{{- end }}

{{/* Returns the service name */}}
{{- define "ipfs-cluster.serviceName" -}}
{{ .Release.Name }}
{{- end }}

{{/* Returns the service name http */}}
{{- define "ipfs-cluster.serviceNameHttp" -}}
{{ .Release.Name }}-http
{{- end }}

{{/* Returns the service name local */}}
{{- define "ipfs-cluster.serviceNameLocal" -}}
{{ .Release.Name }}-local
{{- end }}