import React, { useContext, useEffect, useRef, useState } from 'react';
import { Image, KeyboardAvoidingView, Linking, Platform, SafeAreaView, View } from 'react-native';
import { StateContext } from '../services/stateService';
import FieldText from '../components/fieldText';
import { BACKGROUND_COLOR, Copyright, PASSWORD, PRIMARY_COLOR, USER, USERNAME } from '../constants';
import FCButton from '../components/fcButton';
import FCLink from '../components/fcLink';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import FCLabel from '../components/fcLabel';
import { useNavigation } from '@react-navigation/native';
import APIService from '../services/apiService';
import Toast from 'react-native-simple-toast';
import { CheckBox } from '@ui-kitten/components';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = props =>
{
	const navigation										= useNavigation();
	const context											= useRef( useContext( StateContext ) );
	const [ user, setUser ]									= useState( { username: null, password: null } );
	const [ rememberMe, setRememberMe ]						= useState( false );
	const [ isLoginButtonEnabled, setIsLoginButtonEnabled ]	= useState( false );

	const onForgotPasswordPress	= () => { navigation.navigate( 'ForgotPassword' ); };
	const onCopyrightPress		= () => { Linking.openURL( 'https://www.funeralcall.com' ); };
	const update				= ( key, value ) => { setUser( { ...user, [key]: value } ); };

	useEffect( () =>
	{
		AsyncStorage.getItem( USER, ( err, result ) =>
		{
			if( !err && result )
			{
				const userLocal = JSON.parse( result );

				setUser( userLocal );
				setRememberMe( true );

				authenticate( userLocal, true );
			}
		} );

	}, [] );

	useEffect( () =>
	{
		if( ( user.username ) && ( user.password ) )
		{
			setIsLoginButtonEnabled( true );
		}
		else
		{
			setIsLoginButtonEnabled( false );
		}

	}, [ user ] );

	const onLoginPress = () =>
	{
		authenticate( user, rememberMe );
	};

	const authenticate = ( userData, isRememberMe ) =>
	{
		APIService( context.current )
			.authenticate(
				userData,
				function( data )
				{
					if( isRememberMe === true )
					{
						AsyncStorage.setItem( USER, JSON.stringify( { username: userData.username, password: userData.password } ), ( err ) => { onLoginSuccessful(); } );
					}
					else
					{
						AsyncStorage.removeItem( USER, ( err ) => { onLoginSuccessful(); } );
					}
				},
				function( errors )
				{
					Toast.show( 'Unable to authenticate user, please try again', Toast.LONG, [ 'RCTModalHostViewController', 'UIAlertController' ] );
				}
			);
	};

	const onLoginSuccessful = () => { navigation.replace( 'Main' ); };

	return (
			<SafeAreaView style={ { flex: 1, justifyContent: 'center', alignItems: 'center' } }>
				<View style={ { flex: 1, justifyContent: 'flex-end', alignItems: 'center' } }>
					<Image source={ require( '../assets/images/funeral-call-logo.png' ) } style={ { height: 100, resizeMode: 'contain' } }/>
				</View>
				<KeyboardAvoidingView style={ { flex: 2.75, justifyContent: 'center', alignItems: 'center', width: '60%' } } behavior={ Platform.OS === 'ios' ? 'padding' : 'height' }>
					<View style={ { backgroundColor: PRIMARY_COLOR, padding: 10, borderRadius: 45, margin: 15 } }>
						<MaterialIcon name="lock-open-outline" size={ 32 } color={ BACKGROUND_COLOR }/>
					</View>
					<FCLabel label={ 'Sign In' } labelStyle={ { fontSize: 24 } }/>
					<FieldText viewStyle={ { width: '100%', marginTop: 30 } } props={ { placeholder: 'Username' } } value={ user.username } onChangeText={ text => { update( USERNAME, text ); } }/>
					<FieldText viewStyle={ { width: '100%', marginTop: 10 } } props={ { placeholder: 'Password', secureTextEntry: true } } value={ user.password } onChangeText={ text => { update( PASSWORD, text ); } }/>
					<CheckBox style={ { marginTop: 15 } } checked={ rememberMe } onChange={ checked => setRememberMe( checked ) }>Remember me?</CheckBox>
					<View style={ { justifyContent: 'center', alignItems: 'center', flexDirection: 'row', marginTop: 30, marginBottom: 30 } }>
						<FCButton label={ 'LOGIN' } buttonStyle={ { flex: 1, backgroundColor: PRIMARY_COLOR } } onPress={ () => onLoginPress() } disabled={ !isLoginButtonEnabled }/>
					</View>
					<FCLink label={ 'Forgot Password?' } onPress={ () => onForgotPasswordPress() }/>
				</KeyboardAvoidingView>
				<View style={ { flex: 0.5, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 30 } }>
					<FCLink label={ Copyright() } onPress={ () => onCopyrightPress() }/>
				</View>
			</SafeAreaView>
	);
};

export default LoginScreen;
