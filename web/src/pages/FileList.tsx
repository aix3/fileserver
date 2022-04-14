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
import InsertDriveFileRoundedIcon from '@mui/icons-material/InsertDriveFileRounded';
import AddIcon from '@mui/icons-material/Add';
import MoreButton from '../components/MoreButton';

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
function humanFileSize(bytes: number, si= false, dp=1) {
    const thresh = si ? 1000 : 1024;

    if (Math.abs(bytes) < thresh) {
        return bytes + ' B';
    }
    const units = si
        ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
        : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
    let u = -1;
    const r = 10**dp;

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

const rows = window.data as Row[]

function FileList() {
    return (
        <Stack spacing={2} divider={<Divider flexItem/>} justifyContent="center">
            <Breadcrumbs aria-label="breadcrumb">
                <Link underline="hover" color="inherit" href="/">
                    MUI
                </Link>
                <Link
                    underline="hover"
                    color="inherit"
                    href="#"
                >
                    Core
                </Link>
                <Typography color="text.primary">Breadcrumbs</Typography>
            </Breadcrumbs>
            <Fab color="primary" variant="extended" aria-label="add">
                <AddIcon/>
                Upload
            </Fab>

            <TableContainer component={Paper}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell></TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell align="right">Size</TableCell>
                            <TableCell >Modify Time</TableCell>
                            <TableCell align="right"></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row) => (
                            <TableRow
                                key={row.name}
                                sx={{'&:last-child td, &:last-child th': {border: 0}}}
                            >
                                <TableCell align="right" width="10">
                                    { row.is_dir ? <FolderRoundedIcon/> : <InsertDriveFileOutlinedIcon/> }
                                </TableCell>
                                <TableCell>
                                    <Link href={`${window.location.pathname + (row.is_dir ? row.name+'/' : row.name)}`} underline="hover">
                                        {row.name}
                                    </Link>
                                </TableCell>
                                <TableCell align="right">{`${humanFileSize(row.size)}`}</TableCell>
                                <TableCell>{row.mod_time}</TableCell>
                                <TableCell align="right">
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