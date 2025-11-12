import React, { useEffect, useState } from 'react';
import {ScrollView, View} from 'react-native';
import DialogBaseModal from './dialogBaseModal';
import FCLabel from '../components/fcLabel';
import FCButton from '../components/fcButton';
import {formatPhoneNumber, formatPhoneNumberOrNull, NEGATIVE_COLOR, stringHasValue} from '../constants';
import FCContactListItem from '../components/fcContactListItem';
import { getContacts } from '../services/stateService';

const DialogContactList = props =>
{
	const [ contacts, setContacts ] = useState( [] );

	const onCancelPress		= () => { props.onCancelPress && props.onCancelPress(); };
	const onContactPress	= ( contact ) => { props.onContactPress && props.onContactPress( contact ); };

	useEffect( () =>
	{
		if( !props.visible ){ return; }

		let		contactItems	= [];
		const	globalContacts	= getContacts();

		for( let i = 0; i < globalContacts.length; i++ )
		{
			const contact = globalContacts[i];

			if( contact.phoneNumbers )
			{
				for( let x = 0; x < contact.phoneNumbers.length; x++ )
				{
					const phoneNumber	= contact.phoneNumbers[x];
					const contactItem	= { firstName: contact.givenName, lastName: contact.familyName, phone: phoneNumber.number };

					contactItems.push( contactItem );
				}
			}
		}

		contactItems.sort( ( a, b ) => ( a.firstName > b.firstName ) ? 1 : -1 );

		setContacts( contactItems );

	}, [ props ] );

	const renderContacts = () =>
	{
		let contactItems = [];

		for( let i = 0; i < contacts.length; i++ )
		{
			const	contactItem = contacts[i];
			const	phoneNumber	= formatPhoneNumberOrNull( contactItem.phone );
			let		contactName	= null;

			if( stringHasValue( contactItem.firstName ) && stringHasValue( contactItem.lastName ) )
			{
				contactName = contactItem.firstName + ' ' + contactItem.lastName;
			}
			else if( stringHasValue( contactItem.firstName ) )
			{
				contactName = contactItem.firstName;
			}
			else if( stringHasValue( contactItem.lastName ) )
			{
				contactName = contactItem.lastName;
			}

			if( ( contactName === null ) || ( phoneNumber === null ) )
			{
				continue;
			}

			contactItems.push( <FCContactListItem key={ i } displayName={ contactName } phoneNum={ phoneNumber } onPress={ () => onContactPress( contactItem ) }/> );
		}

		return contactItems;
	};

	return (
		<DialogBaseModal visible={ props.visible }>
			<View style={ {  } }>
				<FCLabel label={ 'Select Contact' } labelStyle={ { fontFamily: 'OpenSans-Regular', fontSize: 20, color: '#ffffff', textAlign: 'center', marginBottom: 15 } } />
				<ScrollView style={ { height: 150, backgroundColor: '#ffffff' } }>
					{ renderContacts() }
				</ScrollView>
				<View style={ { justifyContent: 'center', alignItems: 'center', flexDirection: 'row', marginTop: 25 } }>
					<FCButton label={ 'CANCEL' } buttonStyle={ { flex: 1, backgroundColor: NEGATIVE_COLOR } } onPress={ () => onCancelPress() }/>
				</View>
			</View>
		</DialogBaseModal>
	);
};

export default DialogContactList;
