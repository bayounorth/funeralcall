import React, { useContext, useEffect, useRef, useState } from 'react';
import { StateContext } from '../services/stateService';
import APIService from '../services/apiService';
import { SafeAreaView, ScrollView } from 'react-native';
import FCHeader from '../components/fcHeader';
import FCTopNavigation from '../components/fcTopNavigation';
import { BACKGROUND_COLOR } from '../constants';
import FCMessageListItem from '../components/fcMessageListItem';
import { useIsFocused } from '@react-navigation/native';

export default function OfficesScreen( { navigation } )
{
	const context					= useRef( useContext( StateContext ) );
	const isFocused					= useIsFocused();
	const [ offices, setOffices ]	= useState( [] );

	useEffect( () =>
	{
		if( !isFocused ){ return; }

		APIService( context.current ).getClientOffices( { 'page': 1, 'limit': 100 }, function( data ){ setOffices( data.results ); } );

	}, [ isFocused ] );

	const renderOffices = () =>
	{
		let officeItems = [];

		for( let i = 0; i < offices.length; i++ )
		{
			const office = offices[i];

			officeItems.push( <FCMessageListItem key={ i }
												 title={ office.clientName }
												 titleStyle={ { fontFamily: 'OpenSans-Bold' } }
												 subTitle={ 'Account #: ' + office.acctNum }
												 onPress={ ( checked ) => onOfficeItemSelected( i, checked ) }/> );
		}

		return officeItems;
	};

	const onOfficeItemSelected = ( index, checked ) =>
	{
		const office = offices[index];

		navigation.replace( 'OfficeDetail', { officeID: office.officeID } );
	};

	return (
		<SafeAreaView style={ { flex: 1, backgroundColor: BACKGROUND_COLOR } }>
			<FCTopNavigation navigation={ navigation } />
			<FCHeader title={ 'Offices' }/>
			<ScrollView style={ { flex: 1, marginBottom: 20 } }>{ renderOffices() }</ScrollView>
		</SafeAreaView>
	);
}
