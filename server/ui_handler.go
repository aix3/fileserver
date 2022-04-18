package server

import (
	_ "embed"
	"encoding/json"
	"fmt"
	"github.com/aix3/fileserver/web"
	"net/http"
	"sort"
	"strings"
	"text/template"
)

var asset http.Handler
var index *template.Template

func init() {
	dist := web.Dist()
	asset = http.FileServer(http.FS(dist))

	index = template.Must(template.ParseFS(dist, "index.html"))
	for _, t := range index.Templates() {
		fmt.Println(t.Name())
	}
}

type UIHandler struct {
	Fs *FSHandler
}

func (h *UIHandler) accept(r *http.Request) bool {
	if strings.HasPrefix(r.URL.Path, "/_ui/") {
		return true
	}
	accepts := r.Header.Get("Accept")
	for _, a := range strings.Split(accepts, ",") {
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

func (h *UIHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		h.Fs.ServeHTTP(w, r)
		return
	}

	if strings.HasPrefix(r.URL.Path, "/_ui/") {
		asset.ServeHTTP(w, r)
		return
	}

	_, info, err := h.Fs.stat(r.URL.Path)
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	if !info.IsDir() {
		h.Fs.ServeHTTP(w, r)
		return
	}

	infos, err := h.Fs.readDir(r.URL.Path)
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
