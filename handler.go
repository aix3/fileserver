package main

import "net/http"

type handler interface {
	http.Handler
	accept(*http.Request) bool
}