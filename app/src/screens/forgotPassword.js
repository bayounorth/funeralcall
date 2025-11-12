import React, { useContext, useRef, useState } from 'react';
import { Image, Linking, View } from 'react-native';
import FieldText from '../components/fieldText';
import { BACKGROUND_COLOR, Copyright, NEGATIVE_COLOR, PRIMARY_COLOR } from '../constants';
import FCButton from '../components/fcButton';
import FCLink from '../components/fcLink';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import FCLabel from '../components/fcLabel';
import { useNavigation } from '@react-navigation/native';
import APIService from '../services/apiService';
import { StateContext } from '../services/stateService';
import DialogOKCancel from '../dialogs/dialogOKCancel';
import Toast from 'react-native-simple-toast';

const ForgotPasswordScreen = props =>
{
	const navigation						= useNavigation();
	const context							= useRef( useContext( StateContext ) );
	const [ username, setUsername ]			= useState( null );
	const [ modalVisible, setModalVisible ]	= useState( false );

	const onCancelPress		= () => { navigation.goBack(); };
	const onOKDialogPress	= () => { setModalVisible( false ); navigation.goBack(); };
	const onCopyrightPress	= () => { Linking.openURL( 'https://www.funeralcall.com' ); };

	const onRequestPress = () =>
	{
		APIService( context.current )
			.forgotPassword(
				{ username: username },
				function( data )
				{
					setModalVisible( true );
				},
				function( errors ){ Toast.show( 'Unable to request password reset, please try again', Toast.LONG, [ 'RCTModalHostViewController', 'UIAlertController' ] ); }
			);
	};

	return (
			<View style={ { flex: 1, justifyContent: 'center', alignItems: 'center' } }>
				<View style={ { flex: 1, justifyContent: 'flex-end', alignItems: 'center' } }>
					<Image source={ require( '../assets/images/funeral-call-logo.png' ) } style={ { height: 100, resizeMode: 'contain' } }/>
				</View>
				<View style={ { flex: 2.75, justifyContent: 'center', alignItems: 'center', width: '60%' } }>
					<View style={ { backgroundColor: PRIMARY_COLOR, padding: 10, borderRadius: 45, margin: 15 } }>
						<MaterialIcon name="key-outline" size={ 32 } color={ BACKGROUND_COLOR }/>
					</View>
					<FCLabel label={ 'Forgot Password' } labelStyle={ { fontSize: 24 } }/>
					<FCLabel label={ 'Enter the username your account and we\'ll send you an email with a link to reset your password.' } labelStyle={ { fontSize: 18, textAlign: 'center', marginTop: 20 } }/>
					<FieldText viewStyle={ { width: '100%', marginTop: 30 } } props={ { placeholder: 'Username' } } value={ username } onChangeText={ text => { setUsername( text ); } }/>
					<View style={ { justifyContent: 'center', alignItems: 'center', flexDirection: 'row', marginTop: 30, marginBottom: 30 } }>
						<FCButton label={ 'CANCEL' } buttonStyle={ { flex: 1, backgroundColor: NEGATIVE_COLOR, marginEnd: 5 } } onPress={ () => onCancelPress() }/>
						<FCButton label={ 'REQUEST' } buttonStyle={ { flex: 1, backgroundColor: PRIMARY_COLOR, marginStart: 5 } } onPress={ () => onRequestPress() } disabled={ !username }/>
					</View>
				</View>
				<View style={ { flex: 0.5, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 30 } }>
					<FCLink label={ Copyright() } onPress={ () => onCopyrightPress() }/>
				</View>

				<DialogOKCancel visible={ modalVisible } message={ 'A password request has been sent to the email address on file.' } onOKPress={ () => onOKDialogPress() } />
			</View>
	);
};

export default ForgotPasswordScreen;
