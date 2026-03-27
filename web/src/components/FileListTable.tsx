import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import {useTheme} from "@mui/material/styles";

import FolderRoundedIcon from "@mui/icons-material/FolderRounded";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined";
import {humanFileSize, formatModTime} from "../utils/humanize";
import MoreButton from "./MoreButton";
import {useState} from "react";

export interface FileInfo {
    name: string;
    size: number;
    mod_time: string;
    is_dir: boolean;
}

export interface FileListTableProps {
    files: FileInfo[]
    allowDelete: boolean
}

const tableHeadCells = [
    {key: 'name', numeric: false, label: 'Name'},
    {key: 'size', numeric: true, label: 'Size'},
    {key: 'mod_time', numeric: false, label: 'Modified'},
] as const;

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
    if (b[orderBy] < a[orderBy]) {
        return -1;
    }
    if (b[orderBy] > a[orderBy]) {
        return 1;
    }
    return 0;
}

export default function FileListTable(props: FileListTableProps) {
    const [rows, setRows] = useState<FileInfo[]>(props.files)
    const [orderBy, setOrderBy] = useState('');
    const [order, setOrder] = useState<'asc' | 'desc'>('asc');
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

    const handleSort = (_event: React.MouseEvent<unknown>, property: keyof FileInfo) => {
        const isAsc = orderBy === property && order === 'asc';
        const newOrder = isAsc ? 'desc' : 'asc';
        setOrderBy(property);
        setOrder(newOrder);

        const sorted = [...rows].sort((a, b) => {
            return newOrder === 'desc'
                ? descendingComparator(a, b, property)
                : -descendingComparator(a, b, property);
        });
        setRows(sorted);
    };

    const createSortHandler = (property: keyof FileInfo) => (event: React.MouseEvent<unknown>) => {
        handleSort(event, property);
    };

    const linkSx = isMobile
        ? {wordBreak: 'break-word' as const, py: 0.5, display: 'inline-block', flex: 1, minWidth: 0}
        : {wordBreak: 'break-all' as const}

    const renderFolder = (folder: FileInfo) => {
        return (
            <Stack direction="row" alignItems="flex-start" spacing={1} sx={{minWidth: 0, width: '100%'}}>
                <FolderRoundedIcon
                    fontSize="small"
                    sx={{mt: isMobile ? 0.25 : 0, flexShrink: 0, color: 'primary.main', opacity: 0.9}}
                />
                <Link
                    href={`${window.location.pathname + folder.name + '/'}`}
                    underline="hover"
                    color="primary"
                    sx={linkSx}
                >
                    {folder.name}
                </Link>
            </Stack>
        )
    }

    const renderFile = (file: FileInfo) => {
        return (
            <Stack direction="row" alignItems="flex-start" spacing={1} sx={{minWidth: 0, width: '100%'}}>
                <InsertDriveFileOutlinedIcon
                    fontSize="small"
                    sx={{mt: isMobile ? 0.25 : 0, flexShrink: 0, color: 'text.secondary'}}
                />
                <Link
                    href={`${window.location.pathname + file.name}`}
                    underline="hover"
                    color="primary"
                    sx={linkSx}
                >
                    {file.name}
                </Link>
            </Stack>
        )
    }

    if (rows.length === 0) {
        return (
            <Box
                sx={{
                    py: {xs: 5, sm: 7},
                    px: 2,
                    textAlign: 'center',
                }}
            >
                <FolderOpenOutlinedIcon sx={{fontSize: 48, color: 'text.disabled', mb: 1.5}}/>
                <Typography variant="h6" component="p" color="text.primary" sx={{mb: 0.5}}>
                    This folder is empty
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{maxWidth: 360, mx: 'auto'}}>
                    Upload files or create a folder using the buttons above.
                </Typography>
            </Box>
        )
    }

    if (isMobile) {
        return (
            <Box sx={{py: 0.5}}>
                {rows.map((row) => (
                    <Box
                        key={row.name}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            py: 1.5,
                            px: 1.5,
                            minHeight: 56,
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                            '&:last-child': {borderBottom: 0},
                            '&:hover': {bgcolor: 'action.hover'},
                        }}
                    >
                        <Box sx={{flex: 1, minWidth: 0}}>
                            <Stack spacing={0.5} sx={{minWidth: 0}}>
                                {row.is_dir ? renderFolder(row) : renderFile(row)}
                            </Stack>
                            <Typography variant="caption" color="text.secondary" sx={{mt: 0.5, display: 'block'}}>
                                {!row.is_dir && `${humanFileSize(row.size)} · `}{formatModTime(row.mod_time)}
                            </Typography>
                        </Box>
                        {props.allowDelete && (
                            <MoreButton name={row.name} isDir={row.is_dir} allowDelete={props.allowDelete}/>
                        )}
                    </Box>
                ))}
            </Box>
        )
    }

    return (
        <TableContainer
            component={Paper}
            variant="outlined"
            sx={{
                border: 'none',
                borderRadius: 0,
                boxShadow: 'none',
            }}
        >
            <Table size="small" stickyHeader>
                <TableHead>
                    <TableRow>
                        {tableHeadCells.map(cell => (
                            <TableCell
                                key={cell.key}
                                align={cell.numeric ? 'right' : 'left'}
                            >
                                <TableSortLabel
                                    active={orderBy === cell.key}
                                    direction={orderBy === cell.key ? order : 'asc'}
                                    onClick={createSortHandler(cell.key as keyof FileInfo)}
                                >
                                    {cell.label}
                                </TableSortLabel>
                            </TableCell>
                        ))}
                        {props.allowDelete && (
                            <TableCell key="action" align="right" sx={{width: 72}}>
                                Action
                            </TableCell>
                        )}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map((row) => (
                        <TableRow
                            hover
                            key={row.name}
                            sx={{'&:last-child td': {borderBottom: 0}}}
                        >
                            <TableCell>
                                <Stack spacing={1} direction="row" alignItems="center">
                                    {row.is_dir ? renderFolder(row) : renderFile(row)}
                                </Stack>
                            </TableCell>
                            <TableCell align="right" sx={{color: 'text.secondary', whiteSpace: 'nowrap'}}>
                                {row.is_dir ? '—' : humanFileSize(row.size)}
                            </TableCell>
                            <TableCell sx={{whiteSpace: 'nowrap', color: 'text.secondary'}}>
                                {formatModTime(row.mod_time)}
                            </TableCell>
                            {props.allowDelete && (
                                <TableCell align="right">
                                    <MoreButton name={row.name} isDir={row.is_dir} allowDelete={props.allowDelete}/>
                                </TableCell>
                            )}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    )
}
