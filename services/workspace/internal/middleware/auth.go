package middleware

import (
	"net/http"
	"strings"
	"time"

	"github.com/clerk/clerk-sdk-go/v2"
	"github.com/clerk/clerk-sdk-go/v2/jwks"
	"github.com/clerk/clerk-sdk-go/v2/jwt"
	"github.com/tomasohchom/motion/services/workspace/internal/config"
)

var jwksClient *jwks.Client
var cfg *config.Config

func init() {
	cfg = config.Load()
	clerkCfg := &clerk.ClientConfig{}
	clerkCfg.Key = clerk.String(cfg.ClerkKey)
	jwksClient = jwks.NewClient(clerkCfg)
}

// AuthMiddleware verifies the JWT and injects the Clerk user info into context.
func AuthMiddleware(next http.HandlerFunc) http.HandlerFunc {
	if cfg.Environment == "development" {
		return func(w http.ResponseWriter, r *http.Request) {
			next(w, r)
		}
	}
	return func(w http.ResponseWriter, r *http.Request) {
		token := getSessionToken(r)
		if token == "" {
			http.Error(w, "missing authorization token", http.StatusUnauthorized)
			return
		}
		unsafeClaims, err := jwt.Decode(r.Context(), &jwt.DecodeParams{Token: token})
		if err != nil {
			http.Error(w, "invalid token", http.StatusUnauthorized)
			return
		}
		jwk, err := jwt.GetJSONWebKey(r.Context(), &jwt.GetJSONWebKeyParams{
			KeyID:      unsafeClaims.KeyID,
			JWKSClient: jwksClient,
		})
		if err != nil {
			http.Error(w, "invalid key", http.StatusUnauthorized)
			return
		}
		clock := clerk.NewClock()
		_, err = jwt.Verify(r.Context(), &jwt.VerifyParams{
			Token:  token,
			JWK:    jwk,
			Clock:  clock,
			Leeway: time.Second * 10,
		})
		if err != nil {
			http.Error(w, "unauthorized", http.StatusUnauthorized)
			return
		}
		next(w, r)
	}
}

func getSessionToken(r *http.Request) string {
	authHeader := r.Header.Get("Authorization")
	if token, found := strings.CutPrefix(authHeader, "Bearer "); found {
		return token
	}
	cookie, err := r.Cookie("__session")
	if err != nil {
		return ""
	}
	return cookie.Value
}
