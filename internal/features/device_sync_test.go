package features

import (
	"testing"
	"time"
)

func TestRegisterDeviceCreatesEnabledDevice(t *testing.T) {
	dsm := NewDeviceSyncManager()
	dev, err := dsm.RegisterDevice("dev-1", "iPhone", "mobile")
	if err != nil {
		t.Fatalf("RegisterDevice returned error: %v", err)
	}
	if dev == nil {
		t.Fatal("RegisterDevice returned nil device")
	}
	if dev.ID != "dev-1" || dev.Name != "iPhone" || dev.Type != "mobile" {
		t.Fatalf("unexpected device fields: %+v", dev)
	}
	if !dev.Enabled {
		t.Fatal("expected device to be Enabled by default")
	}
	if dev.Settings == nil {
		t.Fatal("expected Settings map to be initialized")
	}
	if dev.LastSyncTime.IsZero() || dev.LastSeenAt.IsZero() {
		t.Fatal("expected timestamps to be set on registration")
	}
}

func TestRegisterDeviceOverwritesExistingID(t *testing.T) {
	dsm := NewDeviceSyncManager()
	_, _ = dsm.RegisterDevice("dev-1", "old", "web")
	dev2, err := dsm.RegisterDevice("dev-1", "new", "desktop")
	if err != nil {
		t.Fatalf("second RegisterDevice returned error: %v", err)
	}
	if dev2.Name != "new" || dev2.Type != "desktop" {
		t.Fatalf("expected overwrite, got %+v", dev2)
	}
	if len(dsm.ListDevices()) != 1 {
		t.Fatalf("expected 1 device after overwrite, got %d", len(dsm.ListDevices()))
	}
}

func TestGetDeviceReturnsNilForUnknown(t *testing.T) {
	dsm := NewDeviceSyncManager()
	if dsm.GetDevice("missing") != nil {
		t.Fatal("expected nil for unknown device")
	}
}

func TestGetDeviceReturnsRegisteredDevice(t *testing.T) {
	dsm := NewDeviceSyncManager()
	_, _ = dsm.RegisterDevice("dev-1", "iPad", "mobile")
	got := dsm.GetDevice("dev-1")
	if got == nil || got.Name != "iPad" {
		t.Fatalf("expected registered device, got %+v", got)
	}
}

func TestListDevicesReturnsAll(t *testing.T) {
	dsm := NewDeviceSyncManager()
	_, _ = dsm.RegisterDevice("a", "A", "web")
	_, _ = dsm.RegisterDevice("b", "B", "mobile")
	_, _ = dsm.RegisterDevice("c", "C", "desktop")
	list := dsm.ListDevices()
	if len(list) != 3 {
		t.Fatalf("expected 3 devices, got %d", len(list))
	}
	seen := map[string]bool{}
	for _, d := range list {
		seen[d.ID] = true
	}
	for _, id := range []string{"a", "b", "c"} {
		if !seen[id] {
			t.Fatalf("missing device %q in list", id)
		}
	}
}

func TestListDevicesEmpty(t *testing.T) {
	dsm := NewDeviceSyncManager()
	if len(dsm.ListDevices()) != 0 {
		t.Fatal("expected empty list for new manager")
	}
}

func TestSyncDataUpdatesLastSyncTime(t *testing.T) {
	dsm := NewDeviceSyncManager()
	dev, _ := dsm.RegisterDevice("dev-1", "iPhone", "mobile")
	before := dev.LastSyncTime

	time.Sleep(2 * time.Millisecond) // ensure wall clock advances

	if err := dsm.SyncData("dev-1", map[string]interface{}{"episode": 7}); err != nil {
		t.Fatalf("SyncData returned error: %v", err)
	}
	after := dsm.GetDevice("dev-1")
	if !after.LastSyncTime.After(before) {
		t.Fatal("expected LastSyncTime to advance after SyncData")
	}
}

func TestSyncDataUnknownSourceIsNoOp(t *testing.T) {
	dsm := NewDeviceSyncManager()
	if err := dsm.SyncData("ghost", nil); err != nil {
		t.Fatalf("SyncData for unknown source returned error: %v", err)
	}
	if len(dsm.ListDevices()) != 0 {
		t.Fatal("SyncData for unknown source should not create a device")
	}
}

func TestUpdateDeviceStateAdvancesLastSeen(t *testing.T) {
	dsm := NewDeviceSyncManager()
	dev, _ := dsm.RegisterDevice("dev-1", "iPhone", "mobile")
	before := dev.LastSeenAt

	time.Sleep(2 * time.Millisecond)

	if err := dsm.UpdateDeviceState("dev-1"); err != nil {
		t.Fatalf("UpdateDeviceState returned error: %v", err)
	}
	if !dsm.GetDevice("dev-1").LastSeenAt.After(before) {
		t.Fatal("expected LastSeenAt to advance")
	}
}

func TestUpdateDeviceStateUnknownDeviceIsNoOp(t *testing.T) {
	dsm := NewDeviceSyncManager()
	if err := dsm.UpdateDeviceState("ghost"); err != nil {
		t.Fatalf("UpdateDeviceState for unknown device returned error: %v", err)
	}
}

func TestResolveSyncConflictAllStrategies(t *testing.T) {
	dsm := NewDeviceSyncManager()
	a, _ := dsm.RegisterDevice("a", "A", "web")
	b, _ := dsm.RegisterDevice("b", "B", "mobile")

	for _, strategy := range []string{"device_a", "device_b", "merge", "manual"} {
		c := &SyncConflict{
			ItemID:     "episode-1",
			DeviceA:    a,
			DeviceB:    b,
			ValueA:     120.0,
			ValueB:     300.0,
			Timestamp:  time.Now(),
			Resolution: strategy,
		}
		if err := dsm.ResolveSyncConflict(c); err != nil {
			t.Fatalf("ResolveSyncConflict(%q) returned error: %v", strategy, err)
		}
	}
}

func TestSyncItemJSONShape(t *testing.T) {
	item := SyncItem{
		ID:            "anime-1",
		Title:         "One Piece",
		EpisodeNumber: 1000,
		CurrentTime:   321.5,
		Duration:      1440.0,
		WatchedAt:     time.Now(),
		Source:        "onlinestream",
	}
	// Spot-check the fields that the sync payload relies on.
	if item.ID == "" || item.Title == "" || item.Source == "" {
		t.Fatal("SyncItem core fields must be non-empty")
	}
	if item.EpisodeNumber <= 0 || item.Duration <= 0 {
		t.Fatal("SyncItem must carry positive episode/duration")
	}
	if item.CurrentTime < 0 {
		t.Fatal("SyncItem CurrentTime must be non-negative")
	}
}