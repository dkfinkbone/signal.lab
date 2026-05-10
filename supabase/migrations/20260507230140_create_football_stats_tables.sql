
CREATE TABLE IF NOT EXISTS matches (
  id              BIGSERIAL PRIMARY KEY,
  match_id        TEXT        NOT NULL UNIQUE,
  league_id       INTEGER     NOT NULL,
  season          TEXT,
  round           TEXT,
  date            TIMESTAMPTZ,
  home_team_id    TEXT,
  home_team_name  TEXT,
  away_team_id    TEXT,
  away_team_name  TEXT,
  score_home      INTEGER,
  score_away      INTEGER,
  score_str       TEXT,
  finished        BOOLEAN     DEFAULT FALSE,
  started         BOOLEAN     DEFAULT FALSE,
  synced_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS matches_league_id_idx  ON matches (league_id);
CREATE INDEX IF NOT EXISTS matches_date_idx        ON matches (date);
CREATE INDEX IF NOT EXISTS matches_home_team_idx   ON matches (home_team_id);
CREATE INDEX IF NOT EXISTS matches_away_team_idx   ON matches (away_team_id);

CREATE TABLE IF NOT EXISTS match_stats (
  id                 BIGSERIAL PRIMARY KEY,
  match_id           TEXT        NOT NULL REFERENCES matches (match_id) ON DELETE CASCADE,
  home_corners       INTEGER,
  away_corners       INTEGER,
  home_yellow_cards  INTEGER,
  away_yellow_cards  INTEGER,
  home_red_cards     INTEGER,
  away_red_cards     INTEGER,
  home_xg            NUMERIC(5,2),
  away_xg            NUMERIC(5,2),
  home_shots         INTEGER,
  away_shots         INTEGER,
  home_shots_on_target INTEGER,
  away_shots_on_target INTEGER,
  home_possession    NUMERIC(5,2),
  away_possession    NUMERIC(5,2),
  home_fouls         INTEGER,
  away_fouls         INTEGER,
  home_offsides      INTEGER,
  away_offsides      INTEGER,
  home_passes        INTEGER,
  away_passes        INTEGER,
  home_pass_accuracy NUMERIC(5,2),
  away_pass_accuracy NUMERIC(5,2),
  full_stats         JSONB,
  synced_at          TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (match_id)
);

CREATE TABLE IF NOT EXISTS match_lineups (
  id                  BIGSERIAL PRIMARY KEY,
  match_id            TEXT        NOT NULL REFERENCES matches (match_id) ON DELETE CASCADE,
  team_id             TEXT,
  team_name           TEXT,
  side                TEXT        CHECK (side IN ('home','away')),
  formation           TEXT,
  starters            JSONB,
  substitutes         JSONB,
  coach_name          TEXT,
  synced_at           TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (match_id, side)
);

CREATE INDEX IF NOT EXISTS match_stats_match_id_idx   ON match_stats (match_id);
CREATE INDEX IF NOT EXISTS match_lineups_match_id_idx ON match_lineups (match_id);
CREATE INDEX IF NOT EXISTS match_lineups_team_id_idx  ON match_lineups (team_id);
;
