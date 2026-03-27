import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import useMediaQuery from '@mui/material/useMediaQuery';
import {useTheme} from '@mui/material/styles';
import {useState} from "react";
import axios from "axios";

export interface MoreButtonProps {
    name: string
    isDir: boolean
    allowDelete: boolean
}

export default function MoreButton(props: MoreButtonProps) {
    const theme = useTheme()
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)

    if (!props.allowDelete) {
        return null
    }

    const targetPath = props.isDir
        ? window.location.pathname + props.name + '/'
        : window.location.pathname + props.name

    const handleDelete = () => {
        setDeleting(true)
        axios.delete(targetPath)
            .then(() => {
                window.location.reload()
            })
            .catch((err) => {
                setErrorMsg(err.response?.statusText || err.message || 'Delete failed')
                setDeleting(false)
                setConfirmOpen(false)
            })
    }

    return (
        <>
            <IconButton
                aria-label={`Delete ${props.isDir ? 'folder' : 'file'} ${props.name}`}
                size="medium"
                onClick={() => setConfirmOpen(true)}
                sx={{flexShrink: 0, color: 'text.secondary', '&:hover': {color: 'error.main'}}}
            >
                <DeleteIcon fontSize="small"/>
            </IconButton>
            <Dialog
                open={confirmOpen}
                fullScreen={fullScreen}
                fullWidth
                maxWidth="xs"
                onClose={() => !deleting && setConfirmOpen(false)}
                PaperProps={{
                    sx: fullScreen
                        ? {
                            pt: 'max(12px, env(safe-area-inset-top))',
                            pb: 'max(12px, env(safe-area-inset-bottom))',
                        }
                        : undefined,
                }}
            >
                <DialogTitle>Delete {props.isDir ? 'folder' : 'file'}?</DialogTitle>
                <DialogContent>
                    <DialogContentText component="div">
                        This will permanently delete {props.isDir ? 'folder' : 'file'}{' '}
                        <strong>{props.name}</strong>.
                        {props.isDir && ' Everything inside will be removed.'}
                    </DialogContentText>
                </DialogContent>
                <DialogActions
                    sx={{
                        px: {xs: 2, sm: 3},
                        pb: {xs: 'max(16px, env(safe-area-inset-bottom))', sm: 2},
                        flexDirection: {xs: 'column-reverse', sm: 'row'},
                        gap: 1,
                        '& .MuiButton-root': {marginLeft: '0 !important'},
                    }}
                >
                    <Button fullWidth={fullScreen} onClick={() => setConfirmOpen(false)} disabled={deleting} size="large">
                        Cancel
                    </Button>
                    <Button
                        fullWidth={fullScreen}
                        onClick={handleDelete}
                        color="error"
                        variant="contained"
                        disabled={deleting}
                        size="large"
                    >
                        {deleting ? 'Deleting…' : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>
            <Snackbar
                open={!!errorMsg}
                autoHideDuration={6000}
                onClose={() => setErrorMsg(null)}
                anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}
            >
                <Alert onClose={() => setErrorMsg(null)} severity="error" variant="filled" sx={{width: '100%'}}>
                    {errorMsg}
                </Alert>
            </Snackbar>
        </>
    );
}
