import { BACKGROUND_COLOR, dialNumber, formatPhoneNumber, PRIMARY_COLOR } from '../constants';
import FCTopNavigation from '../components/fcTopNavigation';
import FCHeader from '../components/fcHeader';
import React, { useContext, useRef, useState } from 'react';
import { KeyboardAvoidingView, Linking, Platform, SafeAreaView, ScrollView, View } from 'react-native';
import FormFieldText from '../components/formFieldText';
import FCButton from '../components/fcButton';
import { StateContext } from '../services/stateService';
import FCLabel from '../components/fcLabel';

export default function DialOutScreen( { navigation } )
{
	const context								= useRef( useContext( StateContext ) );
	const [ numberToCall, setNumberToCall ]		= useState( null );
	const [ callerIdNumber, setCallerIdNumber ]	= useState( null );

	const onCellNumberPress = () =>
	{
		const phoneNumber = formatPhoneNumber( numberToCall );

		if( phoneNumber.length === 0 ){ return; }

		Linking.openURL( `tel:${ numberToCall }` );
	};

	const onOfficeNumberPress = () =>
	{
		const phoneNumber = formatPhoneNumber( numberToCall );

		if( phoneNumber.length === 0 ){ return; }

		dialNumber( context, context.current.user.cell_phone_number, numberToCall, context.current.user.office_number );
	};

	const onCallerIdNumberPress = () =>
	{
		const phoneNumber = formatPhoneNumber( callerIdNumber );

		if( phoneNumber.length === 0 ){ return; }

		dialNumber( context, context.current.user.cell_phone_number, numberToCall, callerIdNumber );
	};

	return (
		<SafeAreaView style={ { flex: 1, backgroundColor: BACKGROUND_COLOR } }>
			<FCTopNavigation navigation={ navigation }/>
			<FCHeader title={ 'Dial Out' }/>
			<KeyboardAvoidingView style={ { flex: 1, backgroundColor: '#ffffff', borderRadius: 5, margin: 10 } } behavior={ Platform.OS === 'ios' ? 'padding' : 'height' } keyboardVerticalOffset={ Platform.select( { ios: 50, android: 50 } ) }>
				<ScrollView>
					<FCLabel label={ 'Choose caller id to present.\nPress the button once,\nthen wait as there is a slight delay.' } labelStyle={ { fontFamily: 'OpenSans-Bold', fontSize: 18, color: BACKGROUND_COLOR, textAlign: 'center', margin: 10 } } />

					<FCLabel label={ 'NOTE: If choosing an office number, the system will present a live call to your device from that number. Please accept that call and you will be connected to the “Number To Call”. If you reject the call, the system will still dial the “Number To Call” and the call recipient will receive your device voicemail. ' } labelStyle={ { fontFamily: 'OpenSans-Bold', fontSize: 14, color: BACKGROUND_COLOR, textAlign: 'center', margin: 10 } } />

					<FormFieldText label={ 'Number To Call' } placeholder={ 'Enter number to call' } keyboardType={ 'phone-pad' } value={ numberToCall } onChangeText={ text => { setNumberToCall( text ); } }/>

					{ formatPhoneNumber( context.current.user.cell_phone_number ).length > 0 &&
						<View style={ { width: '100%', alignSelf: 'center', marginTop: 10, paddingStart: 10, paddingEnd: 10 } }>
							<FCButton label={ 'Use cell phone\n' + formatPhoneNumber( context.current.user.cell_phone_number ) } labelStyle={ { fontSize: 18, textAlign: 'center' } } buttonStyle={ { backgroundColor: PRIMARY_COLOR, height: 50 } } onPress={ () => onCellNumberPress() }/>
						</View>
					}

					{ ( formatPhoneNumber( context.current.user.cell_phone_number ).length > 0 ) && ( formatPhoneNumber( context.current.user.office_number ).length > 0 ) &&
						<View style={ { width: '100%', alignSelf: 'center', marginTop: 20, paddingStart: 10, paddingEnd: 10 } }>
							<FCButton label={ 'Use office number\n' + formatPhoneNumber( context.current.user.office_number ) } labelStyle={ { fontSize: 18, textAlign: 'center' } } buttonStyle={ { backgroundColor: PRIMARY_COLOR, height: 50 } } onPress={ () => onOfficeNumberPress() }/>
						</View>
					}

					<View style={ { height: 10 } } />
					<FormFieldText label={ 'Caller Id Number' } placeholder={ 'Enter number to show on caller id' } keyboardType={ 'phone-pad' } value={ callerIdNumber } onChangeText={ text => { setCallerIdNumber( text ); } }/>
					<View style={ { width: '100%', alignSelf: 'center', marginTop: 10, paddingStart: 10, paddingEnd: 10 } }>
						<FCButton label={ 'Use \n' + formatPhoneNumber( callerIdNumber ) } labelStyle={ { fontSize: 18, textAlign: 'center' } } buttonStyle={ { backgroundColor: PRIMARY_COLOR, height: 50 } } onPress={ () => onCallerIdNumberPress() }/>
					</View>
					<View style={ { height: 10 } }/>
				</ScrollView>

			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}
