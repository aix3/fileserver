import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Typography from "@mui/material/Typography";

import FolderRoundedIcon from "@mui/icons-material/FolderRounded";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import {humanFileSize} from "../utils/humanize";
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
}

const tableHeadCells = [
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
    let [rows, setRows] = useState<FileInfo[]>(props.files)

    let [orderBy, setOrderBy] = useState('');
    let [order, setOrder] = useState<'asc' | 'desc'>('asc');

    const handleSort = (event: React.MouseEvent<unknown>, property: keyof FileInfo) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrderBy(property);
        setOrder(isAsc ? 'desc' : 'asc');

        rows.sort((a, b) => {
            return order === 'desc'
                ? descendingComparator(a, b, property)
                : -descendingComparator(a, b, property);
        })
        setRows(rows)
    };

    const createSortHandler = (property: keyof FileInfo) => (event: React.MouseEvent<unknown>) => {
        handleSort(event, property);
    };

    const renderFolder = (folder: FileInfo) => {
        return (
            <>
                <FolderRoundedIcon fontSize="small"/>
                <Link
                    href={`${window.location.pathname + folder.name + '/'}`}
                    underline="hover">
                    {folder.name}
                </Link>
            </>
        )
    }

    const renderFile = (file: FileInfo) => {
        return (
            <>
                <InsertDriveFileOutlinedIcon fontSize="small"/>
                <Link
                    href={`${window.location.pathname + file.name}`}
                    underline="hover">
                    {file.name}
                </Link>
            </>
        )
    }

    return (
        <TableContainer>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        {tableHeadCells.map(cell => {
                            return (
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
                                    {row.is_dir ? renderFolder(row) : renderFile(row)}
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
    )
}