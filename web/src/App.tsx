import './App.less'

import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'

import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import FileList from './components/FileList'
import {FileInfo} from './components/FileListTable'
import ScrollTop from './components/ScrollToTop'

interface InitialData {
    files: FileInfo[]
    path: string
    allow_delete: boolean
}

declare global {
    interface Window {
        __INITIAL_DATA__: InitialData
    }
}

function App() {
    const files = window.__INITIAL_DATA__.files
    const currentPath = window.__INITIAL_DATA__.path
    const allowDelete = window.__INITIAL_DATA__.allow_delete

    return (
        <Box
            component="main"
            sx={{
                minHeight: '100vh',
                bgcolor: 'background.default',
                pb: {xs: 3, sm: 4},
            }}
        >
            <Container maxWidth="lg" sx={{pt: {xs: 2, sm: 3}, px: {xs: 1.5, sm: 3}}}>
                <Stack spacing={2.5}>
                    <Box>
                        <Typography variant="h5" component="h1" sx={{mb: 0.5}}>
                            Files
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Open folders, download files, or upload new content to this directory.
                        </Typography>
                    </Box>

                    <Paper
                        elevation={0}
                        sx={{
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 2,
                            overflow: 'hidden',
                            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.06)',
                        }}
                    >
                        <FileList files={files} currentPath={currentPath} allowDelete={allowDelete}/>
                    </Paper>
                </Stack>
                <ScrollTop/>
            </Container>
        </Box>
    )
}

export default App
