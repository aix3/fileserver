import Box, {BoxProps} from "@mui/material/Box";
import Chip, {ChipProps} from "@mui/material/Chip";
import PropTypes from "prop-types";
import React, {useMemo} from "react";
import ProgressWithLabel from "./ProgressWithLabel";

export interface PreviewListProps {
    classes?: {
        image?: string;
        imageContainer?: string;
        removeButton?: string;
        root?: string;
    };
    fileObjects: File[];
    getPreviewIcon?: (
        fileObject: File,
        classes: PreviewListProps["classes"]
    ) => JSX.Element;
    handleRemove?: (index: number) => ChipProps["onDelete"];
    previewChipProps?: ChipProps;
    previewGridClasses?: { container?: string; item?: string };
    previewGridProps?: { container?: BoxProps; item?: BoxProps };
    showFileNames?: boolean;
    useChipsForPreview?: boolean;
    getProgress: (key: number) => number
}

function PreviewList(props: PreviewListProps) {
    const {
        fileObjects,
        useChipsForPreview,
        previewChipProps,
        getProgress
    } = props;

    const sxGridContainer = useMemo<BoxProps["sx"]>(
        () => ({
            display: "flex",
            flexWrap: "wrap",
            width: "100%",
            gap: 1,
        }),
        [useChipsForPreview]
    );

    const createUpdateProgressHandler = (key: number) => () => {
        return getProgress(key)
    }

    return (
        <Box
            sx={sxGridContainer}
        >
            {fileObjects.map((fileObject, i) => {
                return (
                    <Box
                        key={i}
                    >
                        <Chip
                            variant="outlined"
                            label={fileObject.name}
                            onDelete={() => {let _ = null;}}
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

PreviewList.propTypes = {
    classes: PropTypes.object,
    fileObjects: PropTypes.arrayOf(PropTypes.object).isRequired,
    getPreviewIcon: PropTypes.func.isRequired,
    handleRemove: PropTypes.func.isRequired,
    previewChipProps: PropTypes.object,
    previewGridClasses: PropTypes.object,
    previewGridProps: PropTypes.object,
    showFileNames: PropTypes.bool,
    useChipsForPreview: PropTypes.bool,
};

export default PreviewList;