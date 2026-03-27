package server

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"io/fs"
	"log"
	"net/http"
	"os"
	"path"
	"path/filepath"
	"strings"
	"time"
)

const (
	defaultMaxMemory = 32 << 20 // 32 MB
)

type FSHandler struct {
	Basedir     string
	AllowDelete bool
}

func (h *FSHandler) accept(r *http.Request) bool {
	return true
}

func (h *FSHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	code, err := h.serve(w, r)
	log.Printf("%s %s - %d - %v", r.Method, r.URL.Path, code, err)
}

func (h *FSHandler) serve(w http.ResponseWriter, r *http.Request) (int, error) {
	switch r.Method {
	case http.MethodOptions:
		return h.serveOption(w, r)
	case http.MethodGet:
		return h.serveGet(w, r)
	case http.MethodHead:
		return h.serveGet(w, r)
	case http.MethodDelete:
		return h.serveDelete(w, r)
	case http.MethodPost:
		if r.URL.Query().Get("action") == "mkdir" {
			return h.serveMkdir(w, r)
		}
		return h.serveCreate(w, r, true)
	case http.MethodPut:
		return h.serveCreate(w, r, true)
	default:
		return http.StatusMethodNotAllowed, errors.New("method not allowed")
	}
}

// openRoot returns an os.Root anchored at Basedir.
// All file operations through os.Root are confined to Basedir,
// preventing path traversal at the OS level (Go 1.24+).
func (h *FSHandler) openRoot() (*os.Root, error) {
	return os.OpenRoot(h.Basedir)
}

// toRelPath converts a URL path to a relative path safe for os.Root operations.
// os.Root expects relative paths (no leading slash).
func toRelPath(urlPath string) string {
	p := path.Clean(urlPath)
	p = strings.TrimPrefix(p, "/")
	if p == "" {
		p = "."
	}
	return p
}

type fileInfo struct {
	Name    string    `json:"name"`
	Size    int64     `json:"size"`
	ModTime time.Time `json:"mod_time"`
	IsDir   bool      `json:"is_dir"`
}

func (fi fileInfo) MarshalJSON() ([]byte, error) {
	type alias fileInfo
	tmp := struct {
		alias
		ModTime string `json:"mod_time"`
	}{
		alias:   (alias)(fi),
		ModTime: fi.ModTime.Format(time.RFC3339),
	}
	return json.Marshal(tmp)
}

func (h *FSHandler) serveGet(w http.ResponseWriter, r *http.Request) (int, error) {
	target := r.URL.Path
	file, info, err := h.stat(target)
	if err != nil {
		return http.StatusNotFound, err
	}

	if info.IsDir() {
		infos, err := h.readDir(target)
		if err != nil {
			return http.StatusInternalServerError, err
		}
		bytes, _ := json.Marshal(infos)
		_, _ = w.Write(bytes)
	} else {
		http.ServeContent(w, r, target, info.ModTime(), file)
	}
	return http.StatusOK, nil
}

func (h *FSHandler) readDir(target string) ([]fileInfo, error) {
	root, err := h.openRoot()
	if err != nil {
		return nil, err
	}
	defer root.Close()

	rel := toRelPath(target)
	dir, err := root.Open(rel)
	if err != nil {
		return nil, err
	}
	defer dir.Close()

	entries, err := dir.ReadDir(-1)
	if err != nil {
		return nil, err
	}
	infos := make([]fileInfo, 0, len(entries))
	for _, entry := range entries {
		info, err := entry.Info()
		if err != nil {
			log.Printf("Read %q info error %v", entry.Name(), err)
			continue
		}
		infos = append(infos, fileInfo{
			Name:    info.Name(),
			Size:    info.Size(),
			ModTime: info.ModTime(),
			IsDir:   info.IsDir(),
		})
	}
	return infos, nil
}

func (h *FSHandler) stat(target string) (io.ReadSeeker, fs.FileInfo, error) {
	root, err := h.openRoot()
	if err != nil {
		return nil, nil, err
	}
	defer root.Close()

	// root.FS() returns an fs.FS confined to the root directory.
	f, err := http.FS(root.FS()).Open(path.Clean(target))
	if err != nil {
		return nil, nil, err
	}

	stat, err := f.Stat()
	if err != nil {
		return nil, nil, err
	}
	return f, stat, nil
}

func (h *FSHandler) serveCreate(w http.ResponseWriter, r *http.Request, override bool) (int, error) {
	urlPath := r.URL.Path

	var target string
	var file io.ReadCloser

	if r.MultipartForm == nil {
		_ = r.ParseMultipartForm(defaultMaxMemory)
	}
	if r.MultipartForm == nil {
		target = urlPath
		file = r.Body
	} else {
		mf, fh, err := r.FormFile("file")
		if err != nil {
			return http.StatusBadRequest, err
		}
		// Sanitize uploaded filename: strip directory components to prevent
		// crafted filenames like "../../etc/cron".
		cleanName := filepath.Base(fh.Filename)
		if cleanName == "." || cleanName == string(filepath.Separator) {
			return http.StatusBadRequest, fmt.Errorf("invalid filename %q", fh.Filename)
		}
		if strings.HasSuffix(urlPath, "/") {
			target = path.Join(urlPath, cleanName)
		} else {
			target = urlPath
		}
		file = mf
	}

	root, err := h.openRoot()
	if err != nil {
		return http.StatusInternalServerError, err
	}
	defer root.Close()

	rel := toRelPath(target)

	info, err := root.Stat(rel)
	if err == nil {
		if info.IsDir() {
			return http.StatusConflict, fmt.Errorf("%q is a existing directory", target)
		}
		if info.Size() > 0 {
			if override {
				_ = root.Remove(rel)
			} else {
				return http.StatusConflict, fmt.Errorf("%q already exist", target)
			}
		}
	}

	// Ensure parent directories exist.
	// os.Root.MkdirAll is not available, so create parents via os.MkdirAll
	// on the resolved path within the root. We use root.Mkdir for each segment.
	if dir := path.Dir(rel); dir != "." {
		if err := mkdirAllInRoot(root, dir); err != nil {
			return http.StatusInternalServerError, err
		}
	}

	dst, err := root.OpenFile(rel, os.O_CREATE|os.O_RDWR|os.O_TRUNC, 0600)
	if err != nil {
		return http.StatusInternalServerError, err
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {
		return http.StatusInternalServerError, err
	}
	w.WriteHeader(http.StatusCreated)
	return http.StatusCreated, nil
}

// mkdirAllInRoot creates all directories along the path within an os.Root.
func mkdirAllInRoot(root *os.Root, dir string) error {
	segments := strings.Split(path.Clean(dir), "/")
	current := ""
	for _, seg := range segments {
		if seg == "" || seg == "." {
			continue
		}
		if current == "" {
			current = seg
		} else {
			current = current + "/" + seg
		}
		err := root.Mkdir(current, os.ModePerm)
		if err != nil && !errors.Is(err, fs.ErrExist) {
			return err
		}
	}
	return nil
}

func (h *FSHandler) serveMkdir(w http.ResponseWriter, r *http.Request) (int, error) {
	name := r.URL.Query().Get("name")
	if name == "" {
		return http.StatusBadRequest, fmt.Errorf("missing 'name' query parameter")
	}

	// Only allow simple directory names — reject path separators and traversal.
	cleanName := filepath.Base(name)
	if cleanName != name || cleanName == "." || cleanName == ".." {
		return http.StatusBadRequest, fmt.Errorf("invalid directory name %q", name)
	}

	root, err := h.openRoot()
	if err != nil {
		return http.StatusInternalServerError, err
	}
	defer root.Close()

	rel := toRelPath(path.Join(r.URL.Path, cleanName))

	if _, err := root.Stat(rel); err == nil {
		return http.StatusConflict, fmt.Errorf("%q already exists", rel)
	}

	if err := root.Mkdir(rel, os.ModePerm); err != nil {
		return http.StatusInternalServerError, err
	}

	w.WriteHeader(http.StatusCreated)
	return http.StatusCreated, nil
}

func (h *FSHandler) serveOption(w http.ResponseWriter, r *http.Request) (int, error) {
	return http.StatusNotImplemented, errors.New("not implemented")
}

func (h *FSHandler) serveDelete(w http.ResponseWriter, r *http.Request) (int, error) {
	if !h.AllowDelete {
		return http.StatusForbidden, errors.New("delete is disabled")
	}

	root, err := h.openRoot()
	if err != nil {
		return http.StatusInternalServerError, err
	}
	defer root.Close()

	rel := toRelPath(r.URL.Path)
	if rel == "." {
		return http.StatusBadRequest, errors.New("cannot delete root directory")
	}

	info, err := root.Stat(rel)
	if err != nil {
		return http.StatusNotFound, fmt.Errorf("%q not found", r.URL.Path)
	}

	if info.IsDir() {
		if err := removeAllInRoot(root, rel); err != nil {
			return http.StatusInternalServerError, err
		}
	} else {
		if err := root.Remove(rel); err != nil {
			return http.StatusInternalServerError, err
		}
	}

	w.WriteHeader(http.StatusNoContent)
	return http.StatusNoContent, nil
}

// removeAllInRoot recursively removes a directory and its contents within an os.Root.
func removeAllInRoot(root *os.Root, dir string) error {
	f, err := root.Open(dir)
	if err != nil {
		return err
	}
	entries, err := f.ReadDir(-1)
	f.Close()
	if err != nil {
		return err
	}

	for _, entry := range entries {
		child := dir + "/" + entry.Name()
		if entry.IsDir() {
			if err := removeAllInRoot(root, child); err != nil {
				return err
			}
		} else {
			if err := root.Remove(child); err != nil {
				return err
			}
		}
	}
	return root.Remove(dir)
}
