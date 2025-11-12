import React, { createContext } from 'react';
import DialogLoading from "./dialogs/dialogLoading";

export const StateContext = createContext( {

	loading:	false,
	access:		0,
	token:		null,
	update:		() => {}
} );

export class StateProvider extends React.Component
{
	update = ( key, value, callback ) =>
	{
		this.setState
		(
			{ [key]: value },
			function()
			{
				// console.log( JSON.stringify( this.state ) );

				if( callback ){ callback(); }
			}
		);
	};

	state = {
		loading:	false,
		access:		0,
		token:		null,
		update:		this.update
	};

	render() {
		return (
			<StateContext.Provider value={ this.state }>
				<DialogLoading open={ this.state.loading }/>
				{ this.props.children }
			</StateContext.Provider>
		);
	}
}