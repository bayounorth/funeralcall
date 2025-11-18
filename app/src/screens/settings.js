import React, { useContext, useEffect, useRef, useState } from 'react';
import {SafeAreaView, ScrollView, View} from 'react-native';
import {DrawerActions, useIsFocused} from '@react-navigation/native';
import {Formik, useFormikContext} from 'formik';
import FCTopNavigation from '../components/fcTopNavigation';
import FCHeader from '../components/fcHeader';
import FCButton from '../components/fcButton';
import { BACKGROUND_COLOR, PRIMARY_COLOR, SOUND_FILES, SOUNDS, titleCase } from '../constants';
import { StateContext } from '../services/stateService';
import { Divider, Toggle } from '@ui-kitten/components';
import FCLabel from '../components/fcLabel';
import FormFieldSelect from '../components/formFieldSelect';
import APIService from '../services/apiService';
import DeviceInfo from 'react-native-device-info';
import FormFieldText from '../components/formFieldText';
import messaging from '@react-native-firebase/messaging';

import Toast from 'react-native-simple-toast';
import DialogOKCancel from '../dialogs/dialogOKCancel';

export default function SettingsScreen( { navigation } )
{
	const context																= useRef( useContext( StateContext ) );
	const isFocused																= useIsFocused();
	const [ settings, setSettings ]												= useState( {} );
	const [ manufacturer, setManufacturer ]										= useState( null );
	const [ notificationsEnabled, setNotificationsEnabled ]						= useState( false );
	const [ audioSound, setAudioSound ]											= useState();
	const [ isFormDirty, setIsFormDirty ]										= useState( false );
	const [ modalSaveChangesConfirmVisible, setModalSaveChangesConfirmVisible ] = useState( false );

	const onPlayStandardSound													= ( values ) => { playSound( SOUND_FILES[values.standard_sound] ); };
	const onPlayFirstCallSound													= ( values ) => { playSound( SOUND_FILES[values.firstcall_sound] ); };

	useEffect( () =>
	{
		if( !isFocused ){ setSettings( {} ); return; }

		setSettings( context.current.user );

		DeviceInfo.getManufacturer().then( ( data ) => { setManufacturer( data ); } );

		messaging().hasPermission().then( ( authStatus ) => { setNotificationsEnabled( authStatus === messaging.AuthorizationStatus.AUTHORIZED || authStatus === messaging.AuthorizationStatus.PROVISIONAL ); } );

	}, [ isFocused ] );

	async function playSound( soundFile )
	{
//		const { sound } = await Audio.Sound.createAsync( soundFile );
//
//		setAudioSound( sound );
//
//		await sound.playAsync();
	}

	useEffect( () =>
	{
		return audioSound ? () => { audioSound.unloadAsync(); } : undefined;

	}, [ audioSound ] );

	const onSubmit = ( values, actions ) =>
	{
		updateClientUser( values, null );
	};

	const updateClientUser = ( values, callback ) =>
	{
		APIService( context.current ).updateClientUser( values, function( data )
		{
			Toast.show( 'Settings successfully saved.', Toast.LONG, [ 'RCTModalHostViewController', 'UIAlertController' ] );

			setSettings( values );

			context.current.update( 'user', values, function(){ if( callback ){ callback(); } } );

		}, function( error )
		{
			Toast.show( 'There was an error saving the settings, please try again.', Toast.LONG, [ 'RCTModalHostViewController', 'UIAlertController' ] );
		} );
	};

	const IsDirty = () =>
	{
		const { dirty } = useFormikContext();

		useEffect( () => { setIsFormDirty( dirty ); }, [ dirty ] );

		return null;
	};

	const onRightAccessoryPress = () =>
	{
		if( isFormDirty )
		{
			setModalSaveChangesConfirmVisible( true );
		}
		else
		{
			navigation.dispatch( DrawerActions.toggleDrawer() );
		}
	};

	const onCancelSaveChangesDialogPress = () =>
	{
		setModalSaveChangesConfirmVisible( false );

		navigation.dispatch( DrawerActions.toggleDrawer() );
	};

	const onOKSaveChangesDialogPress = ( values ) =>
	{
		setModalSaveChangesConfirmVisible( false );

		updateClientUser( values, function(){ navigation.dispatch( DrawerActions.toggleDrawer() ); } );
	};

	return (
		<SafeAreaView style={ { flex: 1, backgroundColor: BACKGROUND_COLOR } }>
			<FCTopNavigation navigation={ navigation } onRightAccessoryPress={ onRightAccessoryPress }/>
			<FCHeader title={ 'Settings' }/>
			<Formik enableReinitialize initialValues={ settings } onSubmit={ onSubmit } validateOnChange={ false } validateOnBlur={ false }>
				{ props => {
					return (
					<View style={ { flex: 1 } }>
						<ScrollView style={ { flex: 1, backgroundColor: '#ffffff', borderRadius: 5, margin: 10} }>
							<View style={ { flexDirection: 'row', alignItems: 'center', padding: 10 } }>
								<FCLabel label={ 'Notifications' } labelStyle={ { color: BACKGROUND_COLOR, fontSize: 18, flex: 1, fontFamily: 'OpenSans-Bold' } } />
								<Toggle checked={ props.values.notifications } onChange={ checked => { props.setFieldValue( 'notifications', checked ); } } />
							</View>
							<Divider />
							<View style={ { flexDirection: 'row', flex: 1, paddingEnd: 10, alignItems: 'flex-end' } }>
								<FormFieldSelect label={ 'Standard Sound' } value={ props.values.standard_sound } options={ SOUNDS } onSelect={ id => { props.setFieldValue( 'standard_sound', id ); } }/>
								<FCButton label={ 'PLAY' } labelStyle={ { fontSize: 14, textAlign: 'center' } } buttonStyle={ { width: 50, backgroundColor: PRIMARY_COLOR, marginBottom: 5 } } onPress={ () => onPlayStandardSound( props.values ) }/>
							</View>
							<Divider/>
							<View style={ { flexDirection: 'row', flex: 1, paddingEnd: 10, alignItems: 'flex-end' } }>
								<FormFieldSelect label={ 'FirstCall Sound' } value={ props.values.firstcall_sound } options={ SOUNDS } onSelect={ id => { props.setFieldValue( 'firstcall_sound', id ); } }/>
								<FCButton label={ 'PLAY' } labelStyle={ { fontSize: 14, textAlign: 'center' } } buttonStyle={ { width: 50, backgroundColor: PRIMARY_COLOR, marginBottom: 5 } } onPress={ () => onPlayFirstCallSound( props.values ) }/>
							</View>
							<Divider/>
							<FormFieldText label={ 'Username' } editable={ false } value={ settings.username }/><Divider/>
							<FormFieldText label={ 'Notifications Allowed' } editable={ false } value={ titleCase( notificationsEnabled.toString() ) }/><Divider/>
							<FormFieldText label={ 'OS Name' } editable={ false } value={ DeviceInfo.getSystemName() } /><Divider/>
							<FormFieldText label={ 'OS Version' } editable={ false } value={ DeviceInfo.getSystemVersion() } /><Divider/>
							<FormFieldText label={ 'Model' } editable={ false } value={ DeviceInfo.getModel() } /><Divider/>
							<FormFieldText label={ 'Manufacturer' } editable={ false } value={ manufacturer }/><Divider/>
							<FormFieldText label={ 'App Version' } editable={ false } value={ DeviceInfo.getReadableVersion() }/><Divider/>
						</ScrollView>
						<View style={ { margin: 10, marginTop: 5, marginBottom: 15, flexDirection: 'row' } }>
							<FCButton label={ 'SAVE' } labelStyle={ { fontSize: 18, textAlign: 'center' } } buttonStyle={ { flex: 1, backgroundColor: PRIMARY_COLOR } } onPress={ props.handleSubmit }/>
						</View>
						<IsDirty />
						<DialogOKCancel visible={ modalSaveChangesConfirmVisible } message={ 'Save changes?' } showCancelButton={ 'true' } onCancelPress={ () => onCancelSaveChangesDialogPress() } onOKPress={ () => onOKSaveChangesDialogPress( props.values ) }/>
					</View>
				); } }
			</Formik>

		</SafeAreaView>
	);
}
