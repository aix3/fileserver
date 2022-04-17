import Box, {BoxProps} from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import {useMemo} from "react";
import ProgressWithLabel from "./ProgressWithLabel";

export interface PreviewListProps {
    fileObjects: File[];
    getProgress: (key: number) => number
}

function PreviewList(props: PreviewListProps) {
    const {
        fileObjects,
        getProgress
    } = props;

    const sxGridContainer = useMemo<BoxProps["sx"]>(
        () => ({
            display: "flex",
            flexWrap: "wrap",
            width: "100%",
            gap: 1,
        }),
        []
    );

    const createUpdateProgressHandler = (key: number) => () => {
        return getProgress(key)
    }

    return (
        <Box sx={sxGridContainer}>
            {fileObjects.map((fileObject, i) => {
                return (
                    <Box key={i}>
                        <Chip
                            variant="outlined"
                            label={fileObject.name}
                            onDelete={() => {
                                let _ = null;
                            }}
                            deleteIcon={
                                <ProgressWithLabel valueFn={createUpdateProgressHandler(i)}/>
                            }
                        />
                    </Box>
                );
            })}
        </Box>
    );
}

export default PreviewList;