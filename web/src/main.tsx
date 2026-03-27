import React from 'react'
import ReactDOM from 'react-dom'
import {ThemeProvider} from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import './index.less'
import App from './App'
import {appTheme} from './theme'

ReactDOM.render(
    <React.StrictMode>
        <ThemeProvider theme={appTheme}>
            <CssBaseline/>
            <App/>
        </ThemeProvider>
    </React.StrictMode>,
    document.getElementById('root')
)
