package server

import (
	"crypto/subtle"
	"net/http"
)

// BasicAuthHandler enforces HTTP Basic authentication when Username is set
// (Password may be empty). When AuthWriteOnly is true, only state-changing
// methods require a valid Authorization header; GET/HEAD (and other reads)
// are allowed without credentials.
type BasicAuthHandler struct {
	Username      string
	Password      string
	AuthWriteOnly bool
	Next          http.Handler
}

func writeLikeRequest(r *http.Request) bool {
	switch r.Method {
	case http.MethodPost, http.MethodPut, http.MethodPatch, http.MethodDelete:
		return true
	default:
		return false
	}
}

func (h *BasicAuthHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if h.Username == "" {
		h.Next.ServeHTTP(w, r)
		return
	}

	if h.AuthWriteOnly && !writeLikeRequest(r) {
		h.Next.ServeHTTP(w, r)
		return
	}

	user, pass, ok := r.BasicAuth()
	if !ok ||
		subtle.ConstantTimeCompare([]byte(user), []byte(h.Username)) != 1 ||
		subtle.ConstantTimeCompare([]byte(pass), []byte(h.Password)) != 1 {
		w.Header().Set("WWW-Authenticate", `Basic realm="fileserver"`)
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	h.Next.ServeHTTP(w, r)
}
