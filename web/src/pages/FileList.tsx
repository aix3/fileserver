import {
    Box,
    Breadcrumbs, Button, Chip, Dialog, DialogActions, DialogContent, DialogContentText, DialogProps, DialogTitle,
    Fab,
    Link,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel,
    Typography
} from "@mui/material";

import FolderRoundedIcon from '@mui/icons-material/FolderRounded';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import AddIcon from '@mui/icons-material/Add';
import MoreButton from '../components/MoreButton';
import {DropzoneArea, DropzoneDialog} from "mui-file-dropzone";

import React, {useState} from "react";
import PreviewList from "../components/PreviewList";
import axios from 'axios';


/**
 * Format bytes as human-readable text.
 *
 * @param bytes Number of bytes.
 * @param si True to use metric (SI) units, aka powers of 1000. False to use
 *           binary (IEC), aka powers of 1024.
 * @param dp Number of decimal places to display.
 *
 * @return Formatted string.
 */
function humanFileSize(bytes: number, si = false, dp = 1) {
    const thresh = si ? 1000 : 1024;

    if (Math.abs(bytes) < thresh) {
        return bytes + ' B';
    }
    const units = si
        ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
        : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
    let u = -1;
    const r = 10 ** dp;

    do {
        bytes /= thresh;
        ++u;
    } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);
    return bytes.toFixed(dp) + ' ' + units[u];
}

class Row {
    name: string;
    size: number;
    mod_time: string;
    is_dir: boolean;

    constructor(name: string, size: number, mod_time: string, is_dir: boolean) {
        this.name = name
        this.size = size
        this.mod_time = mod_time
        this.is_dir = is_dir
    }
}

class Breadcrumb {
    name: string;
    url: string;

    constructor(name: string, url: string) {
        this.name = name
        this.url = url
    }
}

function FileList() {
    let [rows, setRows] = useState<Row[]>(window.data.files as Row[])
    let [path, setPath] = useState<string>(window.data.path as string)

    const headCells = [
        {
            key: 'name',
            numeric: false,
            label: 'Name',
        },
        {
            key: 'size',
            numeric: true,
            label: 'Size',
        },
        {
            key: 'mod_time',
            numeric: false,
            label: 'Last Modify Time',
        }
    ];

    let currentDir = function () {
        while (path.endsWith("/")) {
            path = path.substr(0, path.lastIndexOf("/"))
            console.log("end: " + path)
        }
        let segments = path.split("/");
        if (segments.length > 0) {
            return segments[segments.length - 1]
        }
        return "Index"
    }

    let breadcrumbs = function () {
        while (path.endsWith("/")) {
            path = path.substr(0, path.lastIndexOf("/"))
            console.log("end: " + path)
        }
        let segments = path.split("/");
        console.log("segments.length: " + segments.length)

        let pathname = window.location.pathname;
        console.log(pathname)
        console.log(path)

        if (!pathname.endsWith("/")) {
            pathname += "/"
        }

        let bs = []
        for (let i = segments.length - 2; i >= 1; i--) {
            bs.push(new Breadcrumb(segments[i], pathname.concat("../".repeat(segments.length - i - 1))))
        }
        bs.push(new Breadcrumb("Index", pathname.concat("../".repeat(segments.length - 1))));
        return bs.reverse()
    }

    let [orderBy, setOrderBy] = useState('');
    let [order, setOrder] = useState<'asc' | 'desc'>('asc');

    function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
        if (b[orderBy] < a[orderBy]) {
            return -1;
        }
        if (b[orderBy] > a[orderBy]) {
            return 1;
        }
        return 0;
    }

    const handleRequestSort = (
        event: React.MouseEvent<unknown>,
        property: keyof Row,
    ) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);

        rows.sort((a, b) => {
            return order === 'desc'
                ? descendingComparator(a, b, property)
                : -descendingComparator(a, b, property);
        })
        setRows(rows)
    };

    const createSortHandler = (property: keyof Row) => (event: React.MouseEvent<unknown>) => {
        handleRequestSort(event, property);
    };

    const [files, setFiles] = useState<File[]>([])
    const [dropzoneOpen, setDropzoneOpen] = useState<boolean>(false)
    const [uploadOpen, setUploadOpen] = useState<boolean>(false)

    let handleUpload = function (files: File[]) {
        setUploadOpen(true)
        setDropzoneOpen(false)
        setFiles(files)
        uploadFiles(files)
    }

    const [progressMap, setProgressMap] = useState<Map<number, number>>(new Map())

    let handleGetProgress = function (key: number): number {
        console.log("handle get progress", key, progressMap)
        return progressMap.get(key) || 0
    }

    function doUpload(index: number, file: File) {
        const data = new FormData();
        data.append('file', file);

        axios.request( {
            method: "post",
            url: window.location.toString(),
            data: data,
            onUploadProgress: (p) => {
                console.log(index+" p.loaded / p.tota:"+ ((p.loaded / p.total)*100))
                progressMap.set(index, (p.loaded / p.total)*100)
            }
        }).then (data => {
            console.log(index+" finish")
            progressMap.set(index, 100)
        }).catch(err => {
            console.log(index+" error")
            progressMap.set(index, -1)
        })
    }

    const [a, setA] = useState(1)

    const uploadFiles = function (files: File[]) {
        const interval = setInterval(function () {
            let done = true
            progressMap.forEach(value => {
                done &&= (value == 100 || value == -1)
            })
            console.log("done:"+done)
            console.log("progress:"+JSON.stringify(progressMap))


            setA(a+1)
            console.log("a = "+ a)

            if (done) {
                clearInterval(interval)
            }
        }, 1000)

        for (let i = 0; i < files.length; i++) {
            progressMap.set(i, 0)
            doUpload(i, files[i])
        }
    }

    return (
        <Stack spacing={2} justifyContent="center">
            <Stack spacing={2} direction="row" justifyContent="space-between" alignItems="center">
                <Breadcrumbs aria-label="breadcrumb">
                    {breadcrumbs().map(value => {
                        return (
                            <Link underline="hover" color="inherit" href={value.url}>
                                {value.name}
                            </Link>
                        )
                    })}
                    <Typography color="text.primary">
                        {currentDir()}
                    </Typography>
                </Breadcrumbs>
                <DropzoneDialog
                    open={dropzoneOpen}
                    onSave={(files) => handleUpload(files)}
                    onClose={() => setDropzoneOpen(false)}
                    showPreviews={true}
                    useChipsForPreview={true}
                    showFileNamesInPreview={true}
                    filesLimit={100}
                    fullWidth={true}
                    previewText={"Files:"}
                />
                <Dialog
                    open={uploadOpen}
                    fullWidth={true}
                >
                    <DialogTitle id="alert-dialog-title">
                        Upload files
                    </DialogTitle>
                    <DialogContent>
                        <PreviewList fileObjects={files} getProgress={handleGetProgress}/>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setUploadOpen(false)}>CANCEL</Button>
                        <Button disabled variant="contained">
                            CLOSE
                        </Button>
                    </DialogActions>
                </Dialog>
                <Fab color="primary" variant="extended" size="small" onClick={() => setDropzoneOpen(true)}>
                    <AddIcon/>
                    Upload
                </Fab>
            </Stack>

            <TableContainer>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            {headCells.map(cell => {
                                return (
                                    <TableCell
                                        key={cell.key}
                                        align={cell.numeric ? 'right' : 'left'}
                                    >
                                        <TableSortLabel
                                            active={orderBy === cell.key}
                                            direction={orderBy === cell.key ? order : 'asc'}
                                            onClick={createSortHandler(cell.key)}
                                        >
                                            {cell.label}
                                        </TableSortLabel>
                                    </TableCell>
                                )
                            })}
                            <TableCell
                                key="action"
                            >
                                Action
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row) => (
                            <TableRow
                                hover
                                key={row.name}
                                sx={{'&:last-child td, &:last-child th': {border: 0}}}
                            >
                                <TableCell>
                                    <Stack spacing={1} direction="row" alignItems="center">
                                        {row.is_dir ? <FolderRoundedIcon fontSize="small"/> :
                                            <InsertDriveFileOutlinedIcon fontSize="small"/>}
                                        <Link
                                            href={`${window.location.pathname + (row.is_dir ? row.name + '/' : row.name)}`}
                                            underline="hover">
                                            {row.name}
                                        </Link>
                                    </Stack>
                                </TableCell>
                                <TableCell align="right">{`${humanFileSize(row.size)}`}</TableCell>
                                <TableCell width="300">{row.mod_time}</TableCell>
                                <TableCell align="right" width="20">
                                    <MoreButton/>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {rows.length == 0 ?
                    (
                        <Stack alignItems="center">
                            <Typography variant="h5">
                                No content
                            </Typography>
                        </Stack>
                    )
                    : null}
            </TableContainer>
        </Stack>
    )
}

export default FileList