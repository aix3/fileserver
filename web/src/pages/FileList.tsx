import {
    Breadcrumbs,
    Divider,
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

import FolderOpenIcon from '@mui/icons-material/FolderOpen';

function createData(
    name: string,
    calories: number,
    fat: number,
    carbs: number,
    protein: number,
) {
    return {name, calories, fat, carbs, protein};
}

const rows = [
    createData('Frozen yoghurt', 159, 6.0, 24, 4.0),
    createData('Ice cream sandwich', 237, 9.0, 37, 4.3),
    createData('Eclair', 262, 16.0, 24, 6.0),
    createData('Cupcake', 305, 3.7, 67, 4.3),
    createData('Gingerbread', 356, 16.0, 49, 3.9),
];

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

            <TableContainer component={Paper}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell></TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell align="right">Size</TableCell>
                            <TableCell align="right">Modify Time</TableCell>
                            <TableCell align="right">Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row) => (
                            <TableRow
                                key={row.name}
                                sx={{'&:last-child td, &:last-child th': {border: 0}}}
                            >
                                <TableCell align="right" width="10">
                                    <FolderOpenIcon/>
                                </TableCell>
                                <TableCell>
                                    <Link href="#" underline="hover">
                                        {row.name}
                                    </Link>
                                </TableCell>
                                <TableCell align="right">{row.calories}</TableCell>
                                <TableCell align="right">{row.fat}</TableCell>
                                <TableCell align="right">{row.carbs}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Stack>
    )
}

export default FileList