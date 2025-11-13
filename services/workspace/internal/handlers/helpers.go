package handlers

import (
	"time"
)

func parseDate(dateStr string) (time.Time, error) {
	// Parse ISO 8601 date format: YYYY-MM-DD
	return time.Parse("2006-01-02", dateStr)
}

func parseTime(timeStr string) (time.Time, error) {
	// Parse time format: HH:MM:SS
	t, err := time.Parse("15:04:05", timeStr)
	if err != nil {
		// Try alternate format without seconds: HH:MM
		t, err = time.Parse("15:04", timeStr)
	}
	return t, err
}
