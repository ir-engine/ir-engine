export default {
  definitions: {
    team: {
      type: 'object',
      properties: {
        profileId: {
          type: 'string'
        },
        title: {
          type: 'string'
        },
        games_played: {
          type: 'integer'
        },
        wins: {
          type: 'integer'
        },
        losses: {
          type: 'integer'
        },
        won_lost_percentage: {
          type: 'float'
        },
        minutes_per_game: {
          type: 'float'
        },
        points: {
          type: 'float'
        },
        field_goals_made: {
          type: 'float'
        },
        field_goals_attempts: {
          type: 'float'
        },
        field_goals_percentage: {
          type: 'float'
        },
        three_pointers_made: {
          type: 'float'
        },
        three_pointers_attempts: {
          type: 'integer'
        },
        three_pointers_percentage: {
          type: 'float'
        }
      }
    }
  }
}
