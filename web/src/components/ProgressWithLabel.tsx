import * as React from 'react';
import CircularProgress, {CircularProgressProps,} from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';


export default function ProgressWithLabel(
    props: CircularProgressProps & { valueFn: () => number },
) {
    return (
        <Box sx={{position: 'relative', display: 'inline-flex'}}>
            <CircularProgress color="primary" variant="determinate" size={"1.5rem"} value={props.valueFn()} {...props} />
            <Typography
                sx={{
                    right: 5,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    lineHeight: '1'
                }}
                width={"1.5rem"}
                height={"1.5rem"}
                variant="caption"
                color="text.secondary"
                component="div"
            >

                { props.valueFn() == 100 ? <CheckCircleOutlinedIcon color="success"/> : `${Math.round(props.valueFn())}` }
            </Typography>
        </Box>
    );
}