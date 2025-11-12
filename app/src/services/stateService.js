import React, { createContext } from 'react';
import { Subject } from 'rxjs';
import DialogLoading from '../dialogs/dialogLoading';
import Contacts from 'react-native-contacts';

export const PubSub = new Subject();

let msgId		= null;
let contacts	= [];

export const setMessageId	= ( id ) => { msgId = id; };
export const getMessageId	= () => { return msgId; };

export const getContacts	= () => { return contacts; };

export const StateContext = createContext( {

	loading:		false,
	token:			null,
	user:			null,
	fcmToken:		null,
	contacts:		[],

	update:			() => {},
	getContacts:	() => {},
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

	getContacts = ( callback ) =>
	{
		Contacts
			.getAll()
			.then
			(
				function( results )
				{
					contacts = results;

					if( callback ){ callback(); }
				}
			);
	};

	state = {
		loading:		false,
		token:			null,
		user:			null,
		fcmToken:		null,
		contacts:		[],

		update:			this.update,
		getContacts:	this.getContacts
	};

	render()
	{
		return (
			<StateContext.Provider value={ this.state }>
				<DialogLoading loading={ this.state.loading }/>
				{ this.props.children }
			</StateContext.Provider>
		);
	}
}
