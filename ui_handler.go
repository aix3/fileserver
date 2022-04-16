package main

import (
	"embed"
	_ "embed"
	"encoding/json"
	"fmt"
	"io/fs"
	"log"
	"net/http"
	"sort"
	"strings"
	"text/template"
)

//go:embed dist/*
var content embed.FS

var asset http.Handler
var index *template.Template

func init() {
	dist, err := fs.Sub(content, "dist")
	if err != nil {
		panic(err)
	}
	asset = http.FileServer(http.FS(dist))

	index = template.Must(template.ParseFS(dist, "index.html"))
	for _, t := range index.Templates() {
		fmt.Println(t.Name())
	}
}

type uiHandler struct {
	fs *fsHandler
}

func (h *uiHandler) accept(r *http.Request) bool {
	log.Println(r.URL.Path)
	if strings.HasPrefix(r.URL.Path, "/_ui/") {
		return true
	}
	accepts := r.Header.Get("Accept")
	for _, a := range strings.Split(accepts, ",") {
		log.Println(a)
		if a == "text/html" {
			return true
		}
	}
	return false
}

type uiData struct {
	Files []fileInfo `json:"files"`
	Path  string     `json:"path"`
}

func (h *uiHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		h.fs.ServeHTTP(w, r)
		return
	}

	if strings.HasPrefix(r.URL.Path, "/_ui/") {
		asset.ServeHTTP(w, r)
		return
	}

	_, info, err := h.fs.stat(r.URL.Path)
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	if !info.IsDir() {
		h.fs.ServeHTTP(w, r)
		return
	}

	infos, err := h.fs.readDir(r.URL.Path)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	sort.Slice(infos, func(i, j int) bool {
		a, b := infos[i], infos[j]
		if a.IsDir && !b.IsDir {
			return true
		}
		if !a.IsDir && b.IsDir {
			return false
		}
		return a.Name < b.Name
	})

	data := uiData{
		Files: infos,
		Path:  r.URL.Path,
	}

	bytes, _ := json.Marshal(data)

	w.Header().Set("Content-Type", "text/html")

	err = index.Execute(w, string(bytes))
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
}
