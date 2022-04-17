import './App.less'

import '@fontsource/roboto/400.css';

import {Container} from "@mui/material";
import FileList from "./components/FileList"
import {FileInfo} from "./components/FileListTable";

interface InitialData {
    files: FileInfo[]
    path: string
}

declare global {
    interface Window {
        __INITIAL_DATA__: InitialData;
    }
}

function App() {
    const files = window.__INITIAL_DATA__.files
    const currentPath = window.__INITIAL_DATA__.path

    return (
        <Container maxWidth="lg" sx={{marginTop: '20px', marginBottom: '20px'}}>
            <FileList files={files} currentPath={currentPath}/>
        </Container>
    )
}

export default App
