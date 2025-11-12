import React, { useContext, useEffect, useRef, useState } from 'react';
import {AppState, SafeAreaView, ScrollView, View} from 'react-native';
import { BACKGROUND_COLOR, ERROR_COLOR, PRIMARY_COLOR, TRANSPARENT_COLOR } from '../constants';
import FCTopNavigation from '../components/fcTopNavigation';
import FCHeader from '../components/fcHeader';
import FCMessageListItem from '../components/fcMessageListItem';
import FCButton from '../components/fcButton';
import APIService from '../services/apiService';
import { StateContext } from '../services/stateService';
import Toast from 'react-native-simple-toast';
import DialogOKCancel from '../dialogs/dialogOKCancel';
import {useIsFocused} from '@react-navigation/native';
import PushNotification from 'react-native-push-notification';

export default function MessagesScreen( { route, navigation } )
{
	const context														= useRef( useContext( StateContext ) );
	const isFocused														= useIsFocused();
	const appState														= useRef( AppState.currentState );
	const [ isEditMode, setIsEditMode ]									= useState( false );
	const [ messages, setMessages ]										= useState( [] );
	const [ selectedMessages, setSelectedMessages ]						= useState( [] );
	const [ modalReadConfirmVisible, setModalReadConfirmVisible ]		= useState( false );
	const [ modalDeleteConfirmVisible, setModalDeleteConfirmVisible ]	= useState( false );

	const EditButton						= ( props )	=> ( <FCButton { ...props } label={ 'Edit' } labelStyle={ { fontSize: 22, marginLeft: 10 } } onPress={ onEditDoneButtonPress } /> );
	const DoneButton						= ( props )	=> ( <FCButton { ...props } label={ 'Done' } labelStyle={ { fontSize: 22, marginLeft: 10 } } onPress={ onEditDoneButtonPress } /> );
	const onEditDoneButtonPress				= ()		=> { setIsEditMode( !isEditMode ); };
	const onCancelReadMessageDialogPress	= ()		=> { setModalReadConfirmVisible( false ); };
	const onCancelDeleteMessageDialogPress	= ()		=> { setModalDeleteConfirmVisible( false ); };

	useEffect( () =>
	{
		if( ( route.params ) && ( route.params.msgID ) )
		{
			navigation.replace( 'MessageDetail', { msgID: route.params.msgID } );
		}

	}, [ route.params ] );

	const handleAppStateChange = ( state ) =>
	{
		if( appState.current.match( /inactive|background/ ) && state === 'active' )
		{
			console.log( 'App has come to the foreground!' );

			refreshMessages();
		}

		appState.current = state;

		console.log( 'AppState', appState.current );
	};

	useEffect( () =>
	{
		AppState.addEventListener('change', handleAppStateChange );

		return () => { AppState.removeEventListener('change', handleAppStateChange ); };

	}, [] );

	useEffect( () =>
	{
		if( !isFocused ){ return; }

		refreshMessages();

		console.log( 'MessagesScreen::isFocused' );

	}, [ isFocused ] );

	const refreshMessages = () =>
	{
		APIService( context.current ).getMessages( { 'page': 1, 'limit': 100 }, function( data )
		{
			setIsEditMode( false );

			setMessages( data.results );

			PushNotification.setApplicationIconBadgeNumber( parseFloat( data.unreadMessageCount ) );
		} );
	};

	const onMessageItemSelected = ( index, checked ) =>
	{
		const msgID = messages[index].msgID;

		if( !isEditMode )
		{
			navigation.replace( 'MessageDetail', { msgID: msgID } );
		}
		else
		{
			let selected = selectedMessages;

			if( checked === true )
			{
				selected.push( msgID );

				setSelectedMessages( selected );
			}
			else
			{
				const message = selected.indexOf( msgID );

				if( message > -1 )
				{
					selected.splice( message, 1 );

					setSelectedMessages( selected );
				}
			}
		}
	};

	const renderMessages = () =>
	{
		let messageItems = [];

		for( let i = 0; i < messages.length; i++ )
		{
			const	message		= messages[i];
			const	titleStyle	= !message.isRead ? { fontFamily: 'OpenSans-Bold' } : {};
			let		color		= TRANSPARENT_COLOR;

			if( message.marked_death_call === 'Y' )
			{
				color = ERROR_COLOR;
			}
			else
			{
				color = PRIMARY_COLOR;
			}

			messageItems.push( <FCMessageListItem key={ i }
												  title={ message.callerFullName }
												  titleStyle={ titleStyle }
												  subTitle={ message.companyName }
												  dateTime={ message.dateStampFormatted + ' ' + message.timeStampFormatted }
												  message={ message.notes }
												  indicatorColor={ color }
												  isEditMode={ isEditMode }
												  isRead={ message.isRead }
												  addIndicator={ true }
												  onPress={ ( checked ) => onMessageItemSelected( i, checked ) }/> );
		}

		return messageItems;
	};

	const onMarkAsReadPress = () =>
	{
		if( selectedMessages.length === 0 ){ Toast.show( 'Please select messages to mark read', Toast.LONG, [ 'RCTModalHostViewController', 'UIAlertController' ] ); return; }

		setModalReadConfirmVisible( true );
	};

	const onOKReadMessageDialogPress = () =>
	{
		setModalReadConfirmVisible( false );

		setTimeout( () => { APIService( context.current ).markMessagesRead( selectedMessages, function( data ){ refreshMessages(); } ); }, 1000 );
	};

	const onDeletePress = () =>
	{
		if( selectedMessages.length === 0 ){ Toast.show( 'Please select messages to delete', Toast.LONG, [ 'RCTModalHostViewController', 'UIAlertController' ] ); return; }

		setModalDeleteConfirmVisible( true );
	};

	const onOKDeleteMessageDialogPress = () =>
	{
		setModalDeleteConfirmVisible( false );

		setTimeout( () => { APIService( context.current ).deleteMessages( selectedMessages, function( data ){ refreshMessages(); } ); }, 1000 );
	};

	return (
		<SafeAreaView style={ { flex: 1, backgroundColor: BACKGROUND_COLOR } }>
			<FCTopNavigation navigation={ navigation } accessoryLeft={ accessoryLeftProps => isEditMode ? <DoneButton { ...accessoryLeftProps } /> : <EditButton { ...accessoryLeftProps } /> } />
			<FCHeader title={ 'Messages' }/>
			<ScrollView style={ { flex: 1, marginBottom: 20 } }>{ renderMessages() }</ScrollView>
			{ isEditMode &&
				<View style={ { height: 60, backgroundColor: PRIMARY_COLOR, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', paddingStart: 20, paddingEnd: 20 } }>
					<FCButton label={ 'Mark as Read' } labelStyle={ { fontSize: 18 } } onPress={ () => onMarkAsReadPress() }/>
					<View style={ { flex: 1 } } />
					<FCButton label={ 'Delete' } labelStyle={ { fontSize: 18 } } onPress={ () => onDeletePress() }/>
				</View>
			}

			<DialogOKCancel visible={ modalReadConfirmVisible } message={ selectedMessages.length === 1 ? 'Are you sure you want to mark this message as read?' : 'Are you sure you want to mark these messages as read?' } showCancelButton={ 'true' } onCancelPress={ () => onCancelReadMessageDialogPress() } onOKPress={ () => onOKReadMessageDialogPress() }/>

			<DialogOKCancel visible={ modalDeleteConfirmVisible } message={ selectedMessages.length === 1 ? 'Are you sure you want to delete this message?' : 'Are you sure you want to delete these messages?' } showCancelButton={ 'true' } onCancelPress={ () => onCancelDeleteMessageDialogPress() } onOKPress={ () => onOKDeleteMessageDialogPress() }/>
		</SafeAreaView>
	);
}
