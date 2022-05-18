package common

type EnvDataSpecification struct {
	Debug       bool
	GameTypes  []string
	GameTypesSizes  map[string]uint32
}
