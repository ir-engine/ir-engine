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
	"google.golang.org/protobuf/types/known/anypb"
	"lagunalabs/matchmaking/common"
	"log"
	"open-match.dev/open-match/pkg/pb"
)

// generateProfiles generates test profiles for the matchmaker101 tutorial.
func generateProfiles(modes []string, teamSizes map[string]uint32) []*pb.MatchProfile {
	var profiles []*pb.MatchProfile
	for _, mode := range modes {

		profileData := &common.ProfileDataMessage{
			Mode: mode,
			TeamSize: teamSizes[mode],
		}
		buffProfileData, err := anypb.New(profileData)
		if err != nil {
			log.Fatal("Failed to marshal DefaultEvaluationCriteria, got %w.", err)
		}

		profiles = append(profiles, &pb.MatchProfile{
			Name: "mode_based_profile",
			Pools: []*pb.Pool{
				{
					Name: "pool_mode_" + mode,
					TagPresentFilters: []*pb.TagPresentFilter{
						{
							Tag: mode,
						},
					},
				},
			},
			Extensions: map[string]*anypb.Any{
				"profileData": buffProfileData,
			},
		})
	}

	return profiles
}
