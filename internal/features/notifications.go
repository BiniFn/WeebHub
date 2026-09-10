package features

import (
"sync"
"time"
)

// NotificationManager handles all user notifications
type NotificationManager struct {
notifications map[string][]*Notification
mu             sync.RWMutex
}

// Notification represents a user notification
type Notification struct {
ID        string    `json:"id"`
UserID    string    `json:"user_id"`
Type      string    `json:"type"` // info, warning, error, success
Title     string    `json:"title"`
Message   string    `json:"message"`
CreatedAt time.Time `json:"created_at"`
ExpiresAt time.Time `json:"expires_at"`
Read      bool      `json:"read"`
Action    *NotificationAction `json:"action,omitempty"`
}

// NotificationAction represents an action the user can take
type NotificationAction struct {
Label  string `json:"label"`
URL    string `json:"url"`
Callback string `json:"callback"`
}

// NewNotificationManager creates a new notification manager
func NewNotificationManager() *NotificationManager {
return &NotificationManager{
notifications: make(map[string][]*Notification),
}
}

// AddNotification adds a notification for a user
func (nm *NotificationManager) AddNotification(userID string, notif *Notification) {
nm.mu.Lock()
defer nm.mu.Unlock()

notif.CreatedAt = time.Now()
if notif.ExpiresAt.IsZero() {
notif.ExpiresAt = time.Now().Add(7 * 24 * time.Hour)
}

nm.notifications[userID] = append(nm.notifications[userID], notif)
}

// GetNotifications retrieves all notifications for a user
func (nm *NotificationManager) GetNotifications(userID string, includeRead bool) []*Notification {
nm.mu.RLock()
defer nm.mu.RUnlock()

notifs := nm.notifications[userID]
var result []*Notification

for _, n := range notifs {
if time.Now().Before(n.ExpiresAt) && (includeRead || !n.Read) {
result = append(result, n)
}
}

return result
}

// MarkAsRead marks a notification as read
func (nm *NotificationManager) MarkAsRead(userID, notifID string) error {
nm.mu.Lock()
defer nm.mu.Unlock()

notifs := nm.notifications[userID]
for _, n := range notifs {
if n.ID == notifID {
n.Read = true
return nil
}
}

return nil
}

// DeleteNotification deletes a notification
func (nm *NotificationManager) DeleteNotification(userID, notifID string) error {
nm.mu.Lock()
defer nm.mu.Unlock()

notifs := nm.notifications[userID]
for i, n := range notifs {
if n.ID == notifID {
nm.notifications[userID] = append(notifs[:i], notifs[i+1:]...)
return nil
}
}

return nil
}

// CleanupExpiredNotifications removes expired notifications
func (nm *NotificationManager) CleanupExpiredNotifications() {
nm.mu.Lock()
defer nm.mu.Unlock()

now := time.Now()
for userID, notifs := range nm.notifications {
var active []*Notification
for _, n := range notifs {
if now.Before(n.ExpiresAt) {
active = append(active, n)
}
}
nm.notifications[userID] = active
}
}
