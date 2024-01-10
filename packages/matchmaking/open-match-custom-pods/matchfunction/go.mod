module lagunalabs/matchmaking/matchfunction

go 1.14

require (
	github.com/golang/protobuf v1.5.3
	github.com/heptiolabs/healthcheck v0.0.0-20211123025425-613501dd5deb
	google.golang.org/grpc v1.56.3
	lagunalabs/matchmaking/common v0.0.0-00010101000000-000000000000
	open-match.dev/open-match v1.3.0
)

require (
	github.com/prometheus/common v0.32.1 // indirect
	github.com/prometheus/procfs v0.7.3 // indirect
	gopkg.in/DATA-DOG/go-sqlmock.v1 v1.3.0 // indirect
)

replace lagunalabs/matchmaking/common => github.com/XiaNi/matchmaking-common v0.0.0-20211116132022-5c866088088b
