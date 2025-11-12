import React, { useContext, useEffect, useRef } from 'react';
import {Image, PermissionsAndroid, View} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import messaging from '@react-native-firebase/messaging';
import { StateContext } from '../services/stateService';
import { isAndroid } from '../constants';
import Contacts from 'react-native-contacts';

const SplashScreen = props =>
{
	const navigation	= useNavigation();
	const context		= useRef( useContext( StateContext ) );

	useEffect( () =>
	{
		requestUserPermission()
			.then
			(
				function()
				{
					if( isAndroid )
					{
						requestContactsPermissions()
							.then
							(
								function( statuses )
								{
									getContacts( function(){ goToLogin(); } );
								}
							);
					}
					else
					{
						getContacts( function(){ goToLogin(); } );
					}
				}
			);

	}, [] );

	function goToLogin()
	{
		setTimeout( () => { navigation.replace( 'Login' ); }, 1000 );
	}

	async function requestUserPermission()
	{
		const authStatus	= await messaging().requestPermission();
		const enabled		= authStatus === messaging.AuthorizationStatus.AUTHORIZED || authStatus === messaging.AuthorizationStatus.PROVISIONAL;

		if( enabled )
		{
			messaging().getToken()
						.then
						(
							function( token )
							{
								context.current.update( 'fcmToken', token );

								console.log( token );
							}
						);
		}
	}

	async function requestContactsPermissions()
	{
		return await PermissionsAndroid.requestMultiple
											(
												[ PermissionsAndroid.PERMISSIONS.READ_CONTACTS, PermissionsAndroid.PERMISSIONS.WRITE_CONTACTS ],
												{
													'title':			'Contacts',
													'message':			'FuneralCall would like access to your contacts.',
													'buttonPositive':	'Allow Access'
												}
											);
	}

	function getContacts( callback )
	{
		if( isAndroid )
		{
			PermissionsAndroid
				.check( PermissionsAndroid.PERMISSIONS.WRITE_CONTACTS )
				.then( function( result )
				{
					if( result )
					{
						context.current.getContacts( callback );
					}
					else
					{
						callback();
					}
				} );
		}
		else
		{
			Contacts.checkPermission().then( function( result )
			{
				if( result === Contacts.PERMISSION_AUTHORIZED )
				{
					context.current.getContacts( callback );
				}
				else if( result === Contacts.PERMISSION_UNDEFINED )
				{
					Contacts.requestPermission().then( function( result2 )
					{
						if( result2 === Contacts.PERMISSION_AUTHORIZED )
						{
							context.current.getContacts( callback );
						}
						else
						{
							callback();
						}
					} );
				}
				else
				{
					callback();
				}
			} );
		}
	}

	return (
		<View style={ { flex: 1, justifyContent: 'center', alignItems: 'center' } }>
			<Image source={ require( '../assets/images/funeral-call-logo.png' ) } style={ { height: 125, resizeMode: 'contain' } }/>
		</View>
	);
};

export default SplashScreen;
