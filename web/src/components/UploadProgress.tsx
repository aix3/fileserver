import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

interface UploadProgressProps {
    value: number // 0-100 for progress, -1 for error
}

export default function UploadProgress(props: UploadProgressProps) {
    const {value} = props

    if (value === -1) {
        return <ErrorIcon color="error" sx={{fontSize: '1.5rem'}}/>
    }

    if (value >= 100) {
        return <CheckCircleIcon color="success" sx={{fontSize: '1.5rem'}}/>
    }

    return (
        <Box sx={{position: 'relative', display: 'inline-flex'}}>
            <CircularProgress
                variant="determinate"
                size="1.5rem"
                value={value}
            />
            <Typography
                sx={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
                variant="caption"
                color="text.secondary"
                component="div"
            >
                {Math.round(value)}
            </Typography>
        </Box>
    )
}
