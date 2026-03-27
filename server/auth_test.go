package server

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestBasicAuthHandler_writeOnly_publicGET(t *testing.T) {
	called := false
	next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { called = true })

	h := &BasicAuthHandler{
		Username:      "u",
		Password:      "p",
		AuthWriteOnly: true,
		Next:          next,
	}

	req := httptest.NewRequest(http.MethodGet, "/", nil)
	w := httptest.NewRecorder()
	h.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("GET should pass without auth, got %d", w.Code)
	}
	if !called {
		t.Fatal("next handler not called")
	}
}

func TestBasicAuthHandler_writeOnly_requiresAuthPOST(t *testing.T) {
	next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {})

	h := &BasicAuthHandler{
		Username:      "u",
		Password:      "p",
		AuthWriteOnly: true,
		Next:          next,
	}

	req := httptest.NewRequest(http.MethodPost, "/", nil)
	w := httptest.NewRecorder()
	h.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Fatalf("POST without auth, want 401, got %d", w.Code)
	}
}

func TestBasicAuthHandler_allMethods_requireAuthWhenWriteOnlyFalse(t *testing.T) {
	next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {})

	h := &BasicAuthHandler{
		Username:      "u",
		Password:      "p",
		AuthWriteOnly: false,
		Next:          next,
	}

	req := httptest.NewRequest(http.MethodGet, "/", nil)
	w := httptest.NewRecorder()
	h.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Fatalf("GET with auth-all, want 401, got %d", w.Code)
	}
}

func TestBasicAuthHandler_validAuth_passes(t *testing.T) {
	called := false
	next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { called = true })

	h := &BasicAuthHandler{
		Username:      "u",
		Password:      "p",
		AuthWriteOnly: false,
		Next:          next,
	}

	req := httptest.NewRequest(http.MethodGet, "/", nil)
	req.SetBasicAuth("u", "p")
	w := httptest.NewRecorder()
	h.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("want 200, got %d", w.Code)
	}
	if !called {
		t.Fatal("next handler not called")
	}
}
