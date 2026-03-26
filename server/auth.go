package server

import (
	"crypto/subtle"
	"net/http"
)

type BasicAuthHandler struct {
	Username string
	Password string
	Next     http.Handler
}

func (h *BasicAuthHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if h.Username == "" && h.Password == "" {
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
