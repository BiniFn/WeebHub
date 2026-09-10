package features

import (
"time"
)

// QualityOfLifeFeatures provides various UX improvements
type QualityOfLifeFeatures struct {
// Keyboard shortcuts for player
KeyboardShortcutsEnabled bool
// Quick search across all sources
QuickSearchEnabled bool
// Batch operations
BatchOperationsEnabled bool
// Continue watching feature
ContinueWatchingEnabled bool
// Favorites management
FavoritesEnabled bool
// Collections/Playlists
CollectionsEnabled bool
// Advanced filters
AdvancedFiltersEnabled bool
}

// PlayerEnhancements provides keyboard shortcuts and controls
type PlayerEnhancements struct {
Shortcuts map[string]string // Map of key -> action
}

// NewPlayerEnhancements returns default keyboard shortcuts
func NewPlayerEnhancements() *PlayerEnhancements {
return &PlayerEnhancements{
Shortcuts: map[string]string{
"Space":           "toggle_play_pause",
"ArrowRight":      "forward_10s",
"ArrowLeft":       "rewind_10s",
"ArrowUp":         "increase_volume",
"ArrowDown":       "decrease_volume",
"M":               "toggle_mute",
"F":               "toggle_fullscreen",
"P":               "toggle_pip",
"N":               "next_episode",
"B":               "previous_episode",
"T":               "cycle_subtitles",
"S":               "screenshot",
"C":               "toggle_captions",
"L":               "cycle_quality",
"Escape":          "exit_fullscreen",
">":               "increase_speed",
"<":               "decrease_speed",
},
}
}

// QuickSearch provides rapid searching across all sources
type QuickSearch struct {
Query           string
Sources         []string
Results         []SearchResult
LastSearchTime  time.Time
SearchCacheTTL  time.Duration
}

// SearchResult represents a quick search result
type SearchResult struct {
Title       string `json:"title"`
Source      string `json:"source"`
ID          string `json:"id"`
CoverImage  string `json:"cover_image"`
Type        string `json:"type"` // anime, manga, etc
Rating      float64 `json:"rating"`
Description string `json:"description"`
}

// BatchOperation represents a batch operation on multiple items
type BatchOperation struct {
Items     []string // Item IDs
Operation string   // add_to_favorites, mark_watched, etc
Value     interface{}
CreatedAt time.Time
}

// ContinueWatchingItem tracks viewing progress
type ContinueWatchingItem struct {
ID              string    `json:"id"`
Title           string    `json:"title"`
CoverImage      string    `json:"cover_image"`
LastWatchedAt   time.Time `json:"last_watched_at"`
EpisodeNumber   int       `json:"episode_number"`
CurrentTime     float64   `json:"current_time"`
Duration        float64   `json:"duration"`
PercentComplete float64   `json:"percent_complete"`
}

// Favorites represents user's favorite items
type Favorites struct {
AnimeIDs []string  `json:"anime_ids"`
MangaIDs []string  `json:"manga_ids"`
CharacterIDs []string `json:"character_ids"`
AddedAt  time.Time `json:"added_at"`
}

// Collection represents a user-created playlist/collection
type Collection struct {
ID          string    `json:"id"`
Name        string    `json:"name"`
Description string    `json:"description"`
ItemIDs     []string  `json:"item_ids"`
CreatedAt   time.Time `json:"created_at"`
UpdatedAt   time.Time `json:"updated_at"`
IsPrivate   bool      `json:"is_private"`
CoverImage  string    `json:"cover_image"`
}

// AdvancedFilter provides filtering options
type AdvancedFilter struct {
Genres       []string
Status       string // ongoing, completed, upcoming
Season       string // spring, summer, fall, winter
Year         int
MinRating    float64
MaxRating    float64
SourceFilter []string
SearchText   string
SortBy       string // trending, rating, latest
}

// NewQualityOfLifeFeatures creates default QoL features
func NewQualityOfLifeFeatures() *QualityOfLifeFeatures {
return &QualityOfLifeFeatures{
KeyboardShortcutsEnabled:  true,
QuickSearchEnabled:        true,
BatchOperationsEnabled:    true,
ContinueWatchingEnabled:   true,
FavoritesEnabled:          true,
CollectionsEnabled:        true,
AdvancedFiltersEnabled:    true,
}
}
