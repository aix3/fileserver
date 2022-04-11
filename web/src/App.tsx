import './App.less'

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import {Container} from "@mui/material";
import FileList from "./pages/FileList"

function App() {
    return (
        <Container maxWidth="lg" sx={{marginTop: '20px'}}>
            <FileList/>
        </Container>
    )
}

export default App
