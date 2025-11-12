import React, { useContext, useEffect, useRef, useState } from 'react';
import { StateContext } from '../services/stateService';
import { BACKGROUND_COLOR, formatPhoneNumber, stringHasValue } from '../constants';
import FCTopNavigation from '../components/fcTopNavigation';
import FCHeader from '../components/fcHeader';
import { Linking, SafeAreaView, ScrollView } from 'react-native';
import FCButton from '../components/fcButton';
import APIService from '../services/apiService';
import FCMessageDetailItem from '../components/fcMessageDetailItem';

export default function OfficeDetailScreen( { route, navigation } )
{
	const context				= useRef( useContext( StateContext ) );
	const [ office, setOffice ]	= useState( {} );
	const BackButton			= ( props ) => ( <FCButton { ...props } label={ '< Back' } labelStyle={ { fontSize: 22, marginLeft: 10 } } onPress={ onBackButtonPress } /> );
	const onBackButtonPress		= () => { navigation.replace( 'Offices' ); };

	useEffect( () =>
	{
		APIService( context.current ).getClientOffice( route.params.officeID, function( data ){ setOffice( data ); } );

	}, [ route.params ] );

	const onLinkPress = ( link ) =>
	{
		Linking.openURL( `tel:${ link }` );
	};

	return (
		<SafeAreaView style={ { flex: 1, backgroundColor: BACKGROUND_COLOR } }>
			<FCTopNavigation navigation={ navigation } accessoryLeft={ accessoryLeftProps => <BackButton { ...accessoryLeftProps } /> }/>
			<FCHeader title={ 'Office Detail' }/>
			<ScrollView style={ { flex: 1, backgroundColor: '#ffffff', borderRadius: 5, margin: 10 } }>
				{ stringHasValue( office.clientName ) && <FCMessageDetailItem title={ 'Office Name' } message={ office.clientName }/> }
				{ office.acctNum && stringHasValue( office.acctNum.toString() ) && <FCMessageDetailItem title={ 'Account Number' } message={ office.acctNum.toString() }/> }
				{ stringHasValue( office.contactPageFwdNumber1 ) && <FCMessageDetailItem title={ 'Forwarding Phone' } message={ formatPhoneNumber( office.contactPageFwdNumber1 ) } link={ office.contactPageFwdNumber1 } onPress={ ( l ) => onLinkPress( l ) }/> }
				{ stringHasValue( office.contactPageERFwdNumber1 ) && <FCMessageDetailItem title={ 'ER Forwarding Phone' } message={ formatPhoneNumber( office.contactPageERFwdNumber1 ) } link={ office.contactPageERFwdNumber1 } onPress={ ( l ) => onLinkPress( l ) }/> }
			</ScrollView>
		</SafeAreaView>
	);
}
