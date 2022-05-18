module lagunalabs/matchmaking/matchfunction

go 1.14

require (
	github.com/golang/protobuf v1.5.0
	google.golang.org/grpc v1.36.0
	lagunalabs/matchmaking/common v0.0.0-00010101000000-000000000000
	open-match.dev/open-match v1.2.0
)

replace lagunalabs/matchmaking/common => github.com/XiaNi/matchmaking-common v0.0.0-20211116132022-5c866088088b
