import Box from "@mui/material/Box";
import useScrollTrigger from "@mui/material/useScrollTrigger";
import Zoom from "@mui/material/Zoom";
import React from "react";
import Fab from "@mui/material/Fab";
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

function ScrollTop() {
    const trigger = useScrollTrigger({
        disableHysteresis: true,
        threshold: 100,
    });

    const handleClick = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    return (
        <Zoom in={trigger}>
            <Box
                onClick={handleClick}
                role="presentation"
                sx={{
                    position: 'fixed',
                    zIndex: (theme) => theme.zIndex.fab,
                    bottom: 'max(16px, calc(16px + env(safe-area-inset-bottom, 0px)))',
                    right: 'max(16px, calc(16px + env(safe-area-inset-right, 0px)))',
                }}
            >
                <Fab color="primary" size="medium" aria-label="scroll back to top">
                    <KeyboardArrowUpIcon/>
                </Fab>
            </Box>
        </Zoom>
    );
}

export default ScrollTop