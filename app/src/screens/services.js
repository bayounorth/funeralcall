import React, { useContext, useEffect, useRef, useState } from 'react';
import {BACKGROUND_COLOR, dateFormatterAlt, PRIMARY_COLOR} from '../constants';
import { SafeAreaView, ScrollView, View } from 'react-native';
import FCTopNavigation from '../components/fcTopNavigation';
import FCHeader from '../components/fcHeader';
import FCButton from '../components/fcButton';
import { StateContext } from '../services/stateService';
import APIService from '../services/apiService';
import FCMessageListItem from '../components/fcMessageListItem';
import { useIsFocused } from '@react-navigation/native';

export default function ServicesScreen( { navigation } )
{
	const context					= useRef( useContext( StateContext ) );
	const isFocused					= useIsFocused();
	const [ services, setServices ]	= useState( [] );

	useEffect( () =>
	{
		if( !isFocused ){ return; }

		refreshServices();

	}, [ isFocused ] );

	const refreshServices = () =>
	{
		APIService( context.current ).getObituaries( { 'page': 1, 'limit': 100, excludePurged: true }, function( data ){ setServices( data.results ); } );
	};

	const onServiceItemSelected = ( index, checked ) =>
	{
		if( index === -1 )
		{
			navigation.replace( 'ServiceDetail' );
		}
		else
		{
			navigation.replace( 'ServiceDetail', { id: services[index].id } );
		}
	};

	const renderServices = () =>
	{
		let serviceItems = [];

		for ( let i = 0; i < services.length; i++ )
		{
			const service = services[i];

			serviceItems.push( <FCMessageListItem key={ i }
												  title={ service.DecName }
												  titleStyle={ { fontFamily: 'OpenSans-Bold' } }
												  dateTime={ dateFormatterAlt( service.DOD ) }
												  message={ service.Chapel }
												  onPress={ ( checked ) => onServiceItemSelected( i, checked ) }/> );
		}

		return serviceItems;
	};

	return (
		<SafeAreaView style={ { flex: 1, backgroundColor: BACKGROUND_COLOR } }>
			<FCTopNavigation navigation={ navigation }/>
			<FCHeader title={ 'Services' }/>
			<ScrollView style={ { flex: 1, marginBottom: 20 } }>{ renderServices() }</ScrollView>
			<View style={ { margin: 20, marginTop: 0 } }>
				<FCButton label={ 'CREATE' } labelStyle={ { fontSize: 18, textAlign: 'center' } } buttonStyle={ { width: '100%', backgroundColor: PRIMARY_COLOR } } onPress={ () => onServiceItemSelected( -1, false ) }/>
			</View>
		</SafeAreaView>
	);
}
