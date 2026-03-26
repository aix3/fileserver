# fileserver

The `fileserver` can be used as a static file server to share your file and also can as a private file server to upload and download your private files.

## Features
- Directory index
- File download
- File upload (batch upload supported)
- Directory creation
- HTTPS supported
- Basic Auth
- Web UI
- JSON API

## Usage

### Start the server

```bash
# Basic usage
./fileserver -port 8880 -basedir /path/to/files

# With basic auth
./fileserver -port 8880 -basedir /path/to/files -user admin -pass secret

# With TLS
./fileserver -port 8443 -basedir /path/to/files -tls-cert cert.pem -tls-key key.pem

# With TLS and basic auth
./fileserver -port 8443 -basedir /path/to/files -tls-cert cert.pem -tls-key key.pem -user admin -pass secret
```

#### Flags

| Flag       | Default | Description                  |
|------------|---------|------------------------------|
| `-port`    | `8880`  | Which port to listen on      |
| `-basedir` | `.`     | Which directory to serve     |
| `-tls-cert`| `""`    | TLS cert file location       |
| `-tls-key` | `""`    | TLS key file location        |
| `-user`    | `""`    | Basic auth username          |
| `-pass`    | `""`    | Basic auth password          |

> When `-user` and `-pass` are both set, all requests (WebUI and API) require HTTP Basic Authentication.

### API usage

When basic auth is enabled, add `-u user:pass` to all curl commands.

**File upload - Using default file name**

Following command will upload the `img.png` to the directory `/image/a/b/c/` on the file server and produces a file named `img.png`.
 ```bash
 $ curl -T img.png http://localhost:8880/image/a/b/c/
 $ # or
 $ curl -F 'file=@img.png' http://localhost:8880/image/a/b/c/

 # With basic auth
 $ curl -u admin:secret -T img.png http://localhost:8880/image/a/b/c/
 ```

**File upload - Specify file name**

Following command will upload the `img.png` to the directory `/image/a/b/c/` on the file server and produces a file named `another.png`.
 ```bash
 $ curl -T img.png http://localhost:8880/image/a/b/c/another.png
 $ # or
 $ curl -F 'file=@img.png' http://localhost:8880/image/a/b/c/another.png
 ```

> Note:
> 1. If the specified directory does not exist on the file server, this directory will be created first.
> 2. If the file to be uploaded already exists on the file server, the file will be overwritten.

**Create directory**
```bash
$ curl -X POST 'http://localhost:8880/path/to/?action=mkdir&name=new-folder'

# With basic auth
$ curl -u admin:secret -X POST 'http://localhost:8880/path/to/?action=mkdir&name=new-folder'
```

**File download**
```bash
$ curl http://localhost:8880/image/a/b/c/another.png

# With basic auth
$ curl -u admin:secret http://localhost:8880/image/a/b/c/another.png
```

**List directory (JSON)**
```bash
$ curl http://localhost:8880/path/to/dir/

# With basic auth
$ curl -u admin:secret http://localhost:8880/path/to/dir/
```

### UI usage

**Directory index**

The directory index access URL is the same as the API's access URL(Such as `http://localhost:8880/image/a/b/c/`). Just type the URL in the browser, and you'll see what's inside.

> ![Index](_img/index.png)

**File upload (batch)**

Click the "Upload" button to open the upload dialog. You can drag and drop or select multiple files for batch upload.

> ![Upload](_img/upload.png)

**Create directory**

Click the "New Folder" button to create a new directory in the current path.

## Build
```bash
$ make build
```
It will output a binary in the `tmp` directory named `fileserver`.

## Development
```bash
$ make dev
```
It will run an air server to watch code change and reload the server.
