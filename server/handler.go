package server

import "net/http"

type Handler interface {
	http.Handler
	accept(*http.Request) bool
}
