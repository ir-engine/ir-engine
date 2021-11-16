module lagunalabs/matchmaking/matchfunction

go 1.14

require (
	github.com/golang/protobuf v1.4.3
	github.com/kelseyhightower/envconfig v1.4.0
	google.golang.org/grpc v1.36.0
	lagunalabs/matchmaking/common v0.0.0-00010101000000-000000000000
	open-match.dev/open-match v1.2.0
)

replace lagunalabs/matchmaking/common => ../_common
