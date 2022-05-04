package server

import (
	"net/http"
)

type compHandler struct {
	handlers []Handler
}

func NewCompHandler(handlers ...Handler) Handler {
	return &compHandler{
		handlers: handlers,
	}
}

func (h *compHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	handler := h.find(r)
	if handler == nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	handler.ServeHTTP(w, r)
}

func (h *compHandler) accept(r *http.Request) bool {
	return true
}

func (h *compHandler) find(r *http.Request) Handler {
	for _, handler := range h.handlers {
		if handler.accept(r) {
			return handler
		}
	}
	return nil
}
