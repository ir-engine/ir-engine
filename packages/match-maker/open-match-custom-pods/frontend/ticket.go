// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package main

import (
	"math/rand"
	"open-match.dev/open-match/pkg/pb"
	"time"
)

// Ticket generates a Ticket with data using the package configuration.
func makeTicket() *pb.Ticket {
	modes := []string{"mode.demo", "mode.ctf", "mode.battleroyale"}
	ticket := &pb.Ticket{
		SearchFields: &pb.SearchFields{
			Tags: []string{
				modes[rand.Intn(len(modes))],
			},
			DoubleArgs: map[string]float64{
				"time.enterqueue": enterQueueTime(),
			},
		},
	}

	return ticket
}

// enterQueueTime returns the time at which the Ticket entered matchmaking queue. To simulate
// variability, we pick any random second interval in the past 5 seconds as the players queue
// entry time.
func enterQueueTime() float64 {
	return float64(time.Now().Add(-time.Duration(rand.Intn(5)) * time.Second).UnixNano())
}