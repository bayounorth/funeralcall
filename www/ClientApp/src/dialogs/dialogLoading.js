import React from "react";
import { CircularProgress, Dialog, DialogContent, useMediaQuery } from "@material-ui/core";
import { useTheme } from '@material-ui/core/styles';

const DialogLoading = props =>
{
    const theme         = useTheme();
    const fullScreen    = useMediaQuery( theme.breakpoints.down( 'sm' ) );
    
    return (
        <div>
            <Dialog fullScreen={ fullScreen } open={ props.open }>
                <DialogContent>
                    <CircularProgress />
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default DialogLoading;