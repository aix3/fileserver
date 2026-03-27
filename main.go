package main

import (
	"flag"
	"fmt"
	"log"
	"net/http"
	"runtime/debug"
	"strings"

	"github.com/aix3/fileserver/server"
)

type config struct {
	port          int
	basedir       string
	certFile      string
	keyFile       string
	username      string
	password      string
	authWriteOnly bool
	allowDelete   bool
}

var defaultConfig = config{
	port:          8880,
	basedir:       ".",
	certFile:      "",
	keyFile:       "",
	username:      "",
	password:      "",
	authWriteOnly: true,
	allowDelete:   false,
}

var (
	flagAuth      string
	flagAuthScope string
)

func init() {
	flag.IntVar(&defaultConfig.port, "port", defaultConfig.port, "which port to listen on")
	flag.StringVar(&defaultConfig.basedir, "basedir", defaultConfig.basedir, "which directory to serve on")
	flag.StringVar(&defaultConfig.certFile, "tls-cert", defaultConfig.certFile, "TLS cert file location")
	flag.StringVar(&defaultConfig.keyFile, "tls-key", defaultConfig.keyFile, "TLS key file location")

	flag.StringVar(&flagAuth, "auth", "", `HTTP Basic credentials as "username:password" (password may contain ":"). Empty disables Basic auth`)
	flag.StringVar(&flagAuthScope, "auth-scope", "write", `with -auth: "write" = only mutations need Basic Auth (default); "all" = every request needs Basic Auth`)

	flag.BoolVar(&defaultConfig.allowDelete, "allow-delete", defaultConfig.allowDelete, "enable file/directory deletion")
}

func applyAuthFlags() {
	auth := strings.TrimSpace(flagAuth)
	scope := strings.TrimSpace(flagAuthScope)
	if scope == "" {
		scope = "write"
	}

	if auth != "" {
		user, pass, err := parseAuthPair(auth)
		if err != nil {
			log.Fatal(err)
		}
		if user == "" {
			log.Fatal(`-auth: username must not be empty (use "username:password")`)
		}
		defaultConfig.username = user
		defaultConfig.password = pass
		switch strings.ToLower(scope) {
		case "write":
			defaultConfig.authWriteOnly = true
		case "all":
			defaultConfig.authWriteOnly = false
		default:
			log.Fatalf(`-auth-scope: want "write" or "all", got %q`, scope)
		}
	}
}

// parseAuthPair splits on the first ":" only so the password may contain colons.
func parseAuthPair(s string) (user, pass string, err error) {
	i := strings.IndexByte(s, ':')
	if i < 0 {
		return "", "", fmt.Errorf(`-auth: expected "username:password"`)
	}
	return s[:i], s[i+1:], nil
}

func main() {
	flag.Parse()
	applyAuthFlags()

	mux := http.NewServeMux()

	fs := &server.FSHandler{
		Basedir:     defaultConfig.basedir,
		AllowDelete: defaultConfig.allowDelete,
	}
	ui := &server.UIHandler{
		Fs: fs,
	}

	handler := &server.BasicAuthHandler{
		Username:      defaultConfig.username,
		Password:      defaultConfig.password,
		AuthWriteOnly: defaultConfig.authWriteOnly,
		Next:          server.NewCompHandler(ui, fs),
	}
	mux.Handle("/", handler)

	addr := fmt.Sprintf(":%d", defaultConfig.port)

	if info, ok := debug.ReadBuildInfo(); ok {
		fmt.Println("Build version:", info.Main.Version)
	}
	fmt.Println("Listen and serve on", addr)

	if len(defaultConfig.keyFile) == 0 || len(defaultConfig.certFile) == 0 {
		panic(http.ListenAndServe(addr, mux))
	} else {
		panic(http.ListenAndServeTLS(addr, defaultConfig.certFile, defaultConfig.keyFile, mux))
	}
}
