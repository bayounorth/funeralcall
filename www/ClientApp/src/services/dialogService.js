import React, { createContext } from "react";
import {Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from "@material-ui/core";
import ButtonPositive from "../components/buttonPositive";
import ButtonNegative from "../components/buttonNegative";

export const DialogContext = createContext( {
    presentDialog: () => {}
} );

export class DialogProvider extends React.Component
{
    presentDialog = ( open, title, content, negativeTitle, onNegativeClick, positiveTitle, onPositiveClick, data, callback ) =>
	{
		this.setState
		(
			{
                open:               open,
                title:              title,
                content:            content,
                negativeTitle:      negativeTitle,
                onNegativeClick:    onNegativeClick,
                positiveTitle:      positiveTitle,
                data:               data,
                onPositiveClick:    onPositiveClick
            },
            callback
		);
	};

    onNegativeClick = () => { this.setState( { open: false }, function(){ this.state.onNegativeClick(); } ); };
    onPositiveClick = () => { this.setState( { open: false }, function(){ this.state.onPositiveClick && this.state.onPositiveClick( this.state.data ); } ); };
    
    state = {
		open:               false,
		title:              '',
        content:            '',
        negativeTitle:      '',
        onNegativeClick:    null,
        positiveTitle:      '',
        onPositiveClick:    null,
        data:               null,
        presentDialog:      this.presentDialog
	};
    
    render() {
        return (
			<DialogContext.Provider value={ this.state }>
                <Dialog fullScreen={ false } open={ this.state.open } onClose={ this.state.onNegativeClick !== null ? this.onNegativeClick : this.onPositiveClick }>
                    <DialogTitle>{ this.state.title }</DialogTitle>
                    <DialogContent>
                        <DialogContentText>{ this.state.content }</DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        { this.state.onNegativeClick !== null && <ButtonNegative label={ this.state.negativeTitle } onClick={ this.onNegativeClick }/> }
                        <ButtonPositive label={ this.state.positiveTitle } onClick={ this.onPositiveClick }/>
                    </DialogActions>
                </Dialog>
                { this.props.children }
			</DialogContext.Provider>
		);
	}
}