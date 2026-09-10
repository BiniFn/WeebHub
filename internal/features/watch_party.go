package features

import (
"fmt"
"sync"
"time"

"github.com/google/uuid"
)

type WatchPartySession struct {
ID              string    `json:"id"`
Name            string    `json:"name"`
CreatedBy       string    `json:"created_by"`
CreatedAt       time.Time `json:"created_at"`
AnimeID         string    `json:"anime_id"`
EpisodeNumber   int       `json:"episode_number"`
CurrentTime     float64   `json:"current_time"`
IsPlaying       bool      `json:"is_playing"`
Members         []string  `json:"members"`
MaxMembers      int       `json:"max_members"`
IsPrivate       bool      `json:"is_private"`
Password        string    `json:"password,omitempty"`
ExpiresAt       time.Time `json:"expires_at"`
}

type WatchPartyManager struct {
sessions map[string]*WatchPartySession
mu       sync.RWMutex
}

// NewWatchPartyManager creates a new watch party manager
func NewWatchPartyManager() *WatchPartyManager {
return &WatchPartyManager{
sessions: make(map[string]*WatchPartySession),
}
}

// CreateSession creates a new watch party session
func (wpm *WatchPartyManager) CreateSession(name, createdBy, animeID string, isPrivate bool, password string, maxMembers int) (*WatchPartySession, error) {
wpm.mu.Lock()
defer wpm.mu.Unlock()

session := &WatchPartySession{
ID:         uuid.New().String(),
Name:       name,
CreatedBy:  createdBy,
CreatedAt:  time.Now(),
AnimeID:    animeID,
IsPlaying:  false,
Members:    []string{createdBy},
MaxMembers: maxMembers,
IsPrivate:  isPrivate,
Password:   password,
ExpiresAt:  time.Now().Add(24 * time.Hour),
}

wpm.sessions[session.ID] = session
return session, nil
}

// GetSession retrieves a watch party session
func (wpm *WatchPartyManager) GetSession(sessionID string) (*WatchPartySession, error) {
wpm.mu.RLock()
defer wpm.mu.RUnlock()

session, ok := wpm.sessions[sessionID]
if !ok {
return nil, fmt.Errorf("session not found")
}

// Check if session expired
if time.Now().After(session.ExpiresAt) {
return nil, fmt.Errorf("session expired")
}

return session, nil
}

// JoinSession adds a member to the session
func (wpm *WatchPartyManager) JoinSession(sessionID, userID string) error {
wpm.mu.Lock()
defer wpm.mu.Unlock()

session, ok := wpm.sessions[sessionID]
if !ok {
return fmt.Errorf("session not found")
}

if len(session.Members) >= session.MaxMembers {
return fmt.Errorf("session is full")
}

// Check for duplicates
for _, member := range session.Members {
if member == userID {
return fmt.Errorf("user already in session")
}
}

session.Members = append(session.Members, userID)
return nil
}

// LeaveSession removes a member from the session
func (wpm *WatchPartyManager) LeaveSession(sessionID, userID string) error {
wpm.mu.Lock()
defer wpm.mu.Unlock()

session, ok := wpm.sessions[sessionID]
if !ok {
return fmt.Errorf("session not found")
}

newMembers := []string{}
for _, member := range session.Members {
if member != userID {
newMembers = append(newMembers, member)
}
}

if len(newMembers) == 0 {
// Delete session if no members left
delete(wpm.sessions, sessionID)
return nil
}

session.Members = newMembers
return nil
}

// UpdatePlaybackState updates the playback state for all members
func (wpm *WatchPartyManager) UpdatePlaybackState(sessionID string, currentTime float64, isPlaying bool) error {
wpm.mu.Lock()
defer wpm.mu.Unlock()

session, ok := wpm.sessions[sessionID]
if !ok {
return fmt.Errorf("session not found")
}

session.CurrentTime = currentTime
session.IsPlaying = isPlaying
return nil
}

// ListActiveSessions returns all active sessions
func (wpm *WatchPartyManager) ListActiveSessions() []*WatchPartySession {
wpm.mu.RLock()
defer wpm.mu.RUnlock()

var sessions []*WatchPartySession
now := time.Now()

for _, session := range wpm.sessions {
if now.Before(session.ExpiresAt) && !session.IsPrivate {
sessions = append(sessions, session)
}
}

return sessions
}

// CleanupExpiredSessions removes expired sessions
func (wpm *WatchPartyManager) CleanupExpiredSessions() {
wpm.mu.Lock()
defer wpm.mu.Unlock()

now := time.Now()
for id, session := range wpm.sessions {
if now.After(session.ExpiresAt) {
delete(wpm.sessions, id)
}
}
}
