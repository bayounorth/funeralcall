import { BACKGROUND_COLOR, formatPhoneNumber, PRIMARY_COLOR } from '../constants';
import FCTopNavigation from '../components/fcTopNavigation';
import FCHeader from '../components/fcHeader';
import React from 'react';
import { Linking, SafeAreaView, View } from 'react-native';
import FCLabel from '../components/fcLabel';
import FCLink from '../components/fcLink';

export default function ContactUsScreen( { navigation } )
{
	const onDialNumber = ( number ) =>
	{
		Linking.openURL( `tel:${ number }` );
	};

	const onOpenEmail = ( email, subject ) =>
	{
		Linking.openURL( `mailto:${ email }?subject=${ subject }` );
	};

	return (
		<SafeAreaView style={ { flex: 1, backgroundColor: BACKGROUND_COLOR } }>
			<FCTopNavigation navigation={ navigation }/>
			<FCHeader title={ 'Contact Us' }/>
			<View style={ { flex: 1, backgroundColor: '#ffffff', borderRadius: 5, margin: 10, justifyContent: 'center' } }>
				<View style={ { alignItems: 'center', padding: 10 } }>
					<FCLabel label={ 'Main Phone Number' } labelStyle={ { color: BACKGROUND_COLOR, fontSize: 18, fontFamily: 'OpenSans-Bold', marginBottom: 10 } }/>
					<FCLink label={ formatPhoneNumber( '8882390351' ) } labelStyle={ { color: PRIMARY_COLOR, fontFamily: 'OpenSans-Bold', fontSize: 18 } } buttonStyle={ { alignItems: 'flex-start', marginBottom: 10 } } onPress={ () => onDialNumber( '8882390351' ) }/>
				</View>
				<View style={ { alignItems: 'center', padding: 10 } }>
					<FCLabel label={ 'Billing Department' } labelStyle={ { color: BACKGROUND_COLOR, fontSize: 18, fontFamily: 'OpenSans-Bold', marginBottom: 10 } }/>
					<FCLink label={ 'billing@funeralcall.com' } labelStyle={ { color: PRIMARY_COLOR, fontFamily: 'OpenSans-Bold', fontSize: 18 } } buttonStyle={ { alignItems: 'flex-start', marginBottom: 10 } } onPress={ () => onOpenEmail( 'billing@funeralcall.com', 'Billing Department' ) }/>
				</View>

				<View style={ { alignItems: 'center', padding: 10 } }>
					<FCLabel label={ 'Client Relations' } labelStyle={ { color: BACKGROUND_COLOR, fontSize: 18, fontFamily: 'OpenSans-Bold', marginBottom: 10 } }/>
					<FCLink label={ 'clientrelations@funeralcall.com' } labelStyle={ { color: PRIMARY_COLOR, fontFamily: 'OpenSans-Bold', fontSize: 18 } } buttonStyle={ { alignItems: 'flex-start', marginBottom: 10 } } onPress={ () => onOpenEmail( 'clientrelations@funeralcall.com', 'Client Relations' ) }/>
				</View>

				<View style={ { alignItems: 'center', padding: 10 } }>
					<FCLabel label={ 'Programming / Account Updates' } labelStyle={ { color: BACKGROUND_COLOR, fontSize: 18, fontFamily: 'OpenSans-Bold', marginBottom: 10 } }/>
					<FCLink label={ 'support@funeralcall.com' } labelStyle={ { color: PRIMARY_COLOR, fontFamily: 'OpenSans-Bold', fontSize: 18 } } buttonStyle={ { alignItems: 'flex-start', marginBottom: 10 } } onPress={ () => onOpenEmail( 'support@funeralcall.com', 'Programming / Account Updates' ) }/>
				</View>

				<View style={ { height: 150 } } />
			</View>
		</SafeAreaView>
	);
}
