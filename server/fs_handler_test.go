package server

import (
	"bytes"
	"io"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"
)

func Test_fsHandler_serveGetFile(t *testing.T) {
	h := FSHandler{Basedir: "testdata"}

	r := httptest.NewRequest(http.MethodGet, "http://localhost/a.txt", nil)
	w := httptest.NewRecorder()

	code, err := h.serveGet(w, r)
	if err != nil {
		t.Errorf("get file error %v", err)
	}
	if w.Code != 200 {
		t.Errorf("get file error, code %v", w.Code)
	}

	data, _ := io.ReadAll(w.Body)
	t.Logf("get file content %s", data)
	t.Logf("get file code %d", code)
}

func Test_fsHandler_serveGetFile_Head(t *testing.T) {
	h := FSHandler{Basedir: "testdata"}

	r := httptest.NewRequest(http.MethodHead, "http://localhost/a.txt", nil)
	w := httptest.NewRecorder()

	code, err := h.serveGet(w, r)
	if err != nil {
		t.Errorf("get file error %v", err)
	}
	if w.Code != 200 {
		t.Errorf("get file error, code %v", w.Code)
	}

	data, _ := io.ReadAll(w.Body)
	t.Logf("get file content %s", data)
	t.Logf("get file code %d", code)
}

func Test_fsHandler_serveCreateFile(t *testing.T) {
	h := FSHandler{Basedir: "testdata"}

	var b bytes.Buffer
	m := multipart.NewWriter(&b)
	f, _ := m.CreateFormFile("file", "b.txt")
	f.Write([]byte("bcd"))
	m.Close()

	r := httptest.NewRequest(http.MethodPost, "http://localhost/b.txt", bytes.NewReader(b.Bytes()))
	r.Header.Set("Content-Type", m.FormDataContentType())
	w := httptest.NewRecorder()

	code, err := h.serveCreate(w, r, true)
	if err != nil {
		t.Errorf("post file error %v", err)
	}
	if w.Code != 201 {
		t.Errorf("post file error, code %v", w.Code)
	}

	data, _ := io.ReadAll(w.Body)
	t.Logf("post file content %s", data)
	t.Logf("post file code %d", code)
}

func Test_fsHandler_serveCreateFile_Dir(t *testing.T) {
	h := FSHandler{Basedir: "testdata"}

	var b bytes.Buffer
	m := multipart.NewWriter(&b)
	f, _ := m.CreateFormFile("file", "b.txt")
	f.Write([]byte("bcd"))
	m.Close()

	r := httptest.NewRequest(http.MethodPost, "http://localhost/c/d/e/", bytes.NewReader(b.Bytes()))
	r.Header.Set("Content-Type", m.FormDataContentType())
	w := httptest.NewRecorder()

	code, err := h.serveCreate(w, r, true)
	if err != nil {
		t.Errorf("post file error %v", err)
	}
	if w.Code != 201 {
		t.Errorf("post file error, code %v", w.Code)
	}

	data, _ := io.ReadAll(w.Body)
	t.Logf("post file content %s", data)
	t.Logf("post file code %d", code)
}

func Test_serveCreate_rejectsTraversalFilename(t *testing.T) {
	tmpDir := t.TempDir()
	h := FSHandler{Basedir: tmpDir}

	var b bytes.Buffer
	m := multipart.NewWriter(&b)
	f, _ := m.CreateFormFile("file", "../../../etc/cron.d/evil")
	f.Write([]byte("malicious"))
	m.Close()

	r := httptest.NewRequest(http.MethodPost, "http://localhost/", bytes.NewReader(b.Bytes()))
	r.Header.Set("Content-Type", m.FormDataContentType())
	w := httptest.NewRecorder()

	code, _ := h.serveCreate(w, r, true)
	// Filename should be sanitized to "evil", created safely inside tmpDir.
	if code != http.StatusCreated {
		t.Errorf("expected 201, got %d", code)
	}

	// Verify the file was created inside tmpDir, not outside.
	if _, err := os.Stat(filepath.Join(tmpDir, "evil")); err != nil {
		t.Errorf("expected file 'evil' inside tmpDir, got error: %v", err)
	}
	// Verify no escape happened.
	if _, err := os.Stat("/etc/cron.d/evil"); err == nil {
		t.Fatal("path traversal: file was created outside basedir!")
	}
}

func Test_serveCreate_traversalURLPath(t *testing.T) {
	tmpDir := t.TempDir()
	h := FSHandler{Basedir: tmpDir}

	body := bytes.NewReader([]byte("data"))
	r := httptest.NewRequest(http.MethodPut, "http://localhost/../../etc/evil.txt", body)
	w := httptest.NewRecorder()

	code, _ := h.serveCreate(w, r, true)
	// os.Root will reject the traversal path
	if code == http.StatusCreated {
		if _, err := os.Stat("/etc/evil.txt"); err == nil {
			t.Fatal("path traversal: file was created outside basedir!")
		}
	}
	t.Logf("traversal URL path returned code %d (expected rejection)", code)
}

func Test_serveMkdir_rejectsTraversal(t *testing.T) {
	h := FSHandler{Basedir: t.TempDir()}

	tests := []struct {
		name     string
		dirName  string
		wantCode int
	}{
		{"dot-dot", "../escape", http.StatusBadRequest},
		{"slash", "a/b", http.StatusBadRequest},
		{"dot-dot-only", "..", http.StatusBadRequest},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			r := httptest.NewRequest(http.MethodPost, "http://localhost/?action=mkdir&name="+tt.dirName, nil)
			w := httptest.NewRecorder()
			code, _ := h.serveMkdir(w, r)
			if code != tt.wantCode {
				t.Errorf("serveMkdir(name=%q) = %d, want %d", tt.dirName, code, tt.wantCode)
			}
		})
	}
}

func Test_serveMkdir_success(t *testing.T) {
	tmpDir := t.TempDir()
	h := FSHandler{Basedir: tmpDir}

	r := httptest.NewRequest(http.MethodPost, "http://localhost/?action=mkdir&name=newdir", nil)
	w := httptest.NewRecorder()
	code, err := h.serveMkdir(w, r)
	if code != http.StatusCreated {
		t.Errorf("expected 201, got %d, err: %v", code, err)
	}

	if _, err := os.Stat(filepath.Join(tmpDir, "newdir")); err != nil {
		t.Errorf("directory was not created: %v", err)
	}
}

func Test_serveDelete_disabled(t *testing.T) {
	tmpDir := t.TempDir()
	os.WriteFile(filepath.Join(tmpDir, "test.txt"), []byte("data"), 0600)

	h := FSHandler{Basedir: tmpDir, AllowDelete: false}

	r := httptest.NewRequest(http.MethodDelete, "http://localhost/test.txt", nil)
	w := httptest.NewRecorder()
	code, _ := h.serveDelete(w, r)
	if code != http.StatusForbidden {
		t.Errorf("expected 403 when delete disabled, got %d", code)
	}
}

func Test_serveDelete_file(t *testing.T) {
	tmpDir := t.TempDir()
	os.WriteFile(filepath.Join(tmpDir, "test.txt"), []byte("data"), 0600)

	h := FSHandler{Basedir: tmpDir, AllowDelete: true}

	r := httptest.NewRequest(http.MethodDelete, "http://localhost/test.txt", nil)
	w := httptest.NewRecorder()
	code, err := h.serveDelete(w, r)
	if code != http.StatusNoContent {
		t.Errorf("expected 204, got %d, err: %v", code, err)
	}
	if _, err := os.Stat(filepath.Join(tmpDir, "test.txt")); err == nil {
		t.Error("file should have been deleted")
	}
}

func Test_serveDelete_directory(t *testing.T) {
	tmpDir := t.TempDir()
	subDir := filepath.Join(tmpDir, "subdir")
	os.Mkdir(subDir, 0755)
	os.WriteFile(filepath.Join(subDir, "inner.txt"), []byte("data"), 0600)

	h := FSHandler{Basedir: tmpDir, AllowDelete: true}

	r := httptest.NewRequest(http.MethodDelete, "http://localhost/subdir", nil)
	w := httptest.NewRecorder()
	code, err := h.serveDelete(w, r)
	if code != http.StatusNoContent {
		t.Errorf("expected 204, got %d, err: %v", code, err)
	}
	if _, err := os.Stat(subDir); err == nil {
		t.Error("directory should have been deleted")
	}
}

func Test_serveDelete_notFound(t *testing.T) {
	h := FSHandler{Basedir: t.TempDir(), AllowDelete: true}

	r := httptest.NewRequest(http.MethodDelete, "http://localhost/nonexistent", nil)
	w := httptest.NewRecorder()
	code, _ := h.serveDelete(w, r)
	if code != http.StatusNotFound {
		t.Errorf("expected 404, got %d", code)
	}
}

func Test_serveDelete_rootRejected(t *testing.T) {
	h := FSHandler{Basedir: t.TempDir(), AllowDelete: true}

	r := httptest.NewRequest(http.MethodDelete, "http://localhost/", nil)
	w := httptest.NewRecorder()
	code, _ := h.serveDelete(w, r)
	if code != http.StatusBadRequest {
		t.Errorf("expected 400, got %d", code)
	}
}
