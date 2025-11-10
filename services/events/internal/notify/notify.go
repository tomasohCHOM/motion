package notify

import (
	"bytes"
	"context"
	"encoding/json"
	"log"
	"net/http"
	"time"
)

type Notifier struct {
	Endpoint string
	Client   *http.Client
}

func New(endpoint string) *Notifier {
	return &Notifier{
		Endpoint: endpoint,
		Client:   &http.Client{Timeout: 5 * time.Second},
	}
}

func (n *Notifier) NotifyEventCreated(ctx context.Context, projectID string, eventID int64, payload map[string]interface{}) error {
	if n.Endpoint == "" {
		log.Printf("[notify] no endpoint configured, skipping notify for event %d", eventID)
		return nil
	}
	body := map[string]interface{}{
		"project_id": projectID,
		"event_id":   eventID,
		"payload":    payload,
	}
	b, _ := json.Marshal(body)
	req, err := http.NewRequestWithContext(ctx, "POST", n.Endpoint, bytes.NewReader(b))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := n.Client.Do(req)
	if err != nil {
		log.Printf("[notify] failed to send notification: %v", err)
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode >= 400 {
		log.Printf("[notify] notify endpoint returned status %d", resp.StatusCode)
	}
	return nil
}
