package middleware

import (
	"fmt"
	"net/http"

	"github.com/clerk/clerk-sdk-go/v2"
	clerkhttp "github.com/clerk/clerk-sdk-go/v2/http"
)

func AuthMiddleware(next http.HandlerFunc) http.HandlerFunc {
	auth := clerkhttp.WithHeaderAuthorization()
	fmt.Println(auth(next))

	return func(w http.ResponseWriter, r *http.Request) {
		// Wrap next handler with Clerk middleware
		handler := auth(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			_, ok := clerk.SessionClaimsFromContext(r.Context())
			if !ok {
				http.Error(w, "unauthorized", http.StatusUnauthorized)
				return
			}
			next(w, r)
		}))
		handler.ServeHTTP(w, r)
	}
}
