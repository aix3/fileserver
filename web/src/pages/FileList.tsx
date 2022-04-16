import {
    Breadcrumbs,
    Divider,
    Fab,
    Link,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from "@mui/material";

import FolderRoundedIcon from '@mui/icons-material/FolderRounded';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import AddIcon from '@mui/icons-material/Add';
import MoreButton from '../components/MoreButton';
import React from "react";

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
    let rows = window.data.files as Row[]
    let path = window.data.path as string

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
        // while (path.startsWith("/")) {
        //     path = path.substr(1)
        //     console.log("start: "+path)
        // }
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

    let handleUpload = function () {
        // TODO
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
                <Fab color="primary" variant="extended" size="small" aria-label="add" onClick={handleUpload}>
                    <AddIcon/>
                    Upload
                </Fab>
            </Stack>

            <TableContainer component={Paper}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell align="right">Size</TableCell>
                            <TableCell>Last Modify Time</TableCell>
                            <TableCell align="right"/>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row) => (
                            <TableRow
                                key={row.name}
                                sx={{'&:last-child td, &:last-child th': {border: 0}}}
                            >
                                <TableCell>
                                    <Stack spacing={1} direction="row" alignItems="center">
                                        {row.is_dir ? <FolderRoundedIcon/> : <InsertDriveFileOutlinedIcon/>}
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
            </TableContainer>
        </Stack>
    )
}

export default FileList