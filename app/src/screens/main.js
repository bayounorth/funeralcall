import React, { useContext, useEffect, useRef } from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Divider, Drawer, DrawerItem, IndexPath } from '@ui-kitten/components';
import MessagesScreen from './messages';
import { Image, SafeAreaView, View } from 'react-native';
import { BACKGROUND_COLOR, PRIMARY_COLOR, USER } from '../constants';
import { createStackNavigator } from '@react-navigation/stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MessageDetailScreen from './messageDetail';
import ServicesScreen from './services';
import ServiceDetailScreen from './serviceDetail';
import SettingsScreen from './settings';
import { getMessageId, PubSub, setMessageId, StateContext } from '../services/stateService';
import FCButton from '../components/fcButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ContactUsScreen from './contactUs';
import DialOutScreen from './dialOut';
import OfficesScreen from './offices';
import OfficeDetailScreen from './officeDetail';
import PushNotification from 'react-native-push-notification';
import APIService from '../services/apiService';

const MainStack = createStackNavigator();

function MessagesStackView()
{
	return (
		<MainStack.Navigator headerMode="none">
			<MainStack.Screen name="Messages" component={ MessagesScreen }/>
			<MainStack.Screen name="MessageDetail" component={ MessageDetailScreen }/>
		</MainStack.Navigator>
	);
}

function ServicesStackView()
{
	return (
		<MainStack.Navigator headerMode="none">
			<MainStack.Screen name="Services" component={ ServicesScreen }/>
			<MainStack.Screen name="ServiceDetail" component={ ServiceDetailScreen }/>
		</MainStack.Navigator>
	);
}

function OfficesStackView()
{
	return (
		<MainStack.Navigator headerMode="none">
			<MainStack.Screen name="Offices" component={ OfficesScreen }/>
			<MainStack.Screen name="OfficeDetail" component={ OfficeDetailScreen }/>
		</MainStack.Navigator>
	);
}

function SettingsStackView()
{
	return (
		<MainStack.Navigator headerMode="none">
			<MainStack.Screen name="Settings" component={ SettingsScreen }/>
		</MainStack.Navigator>
	);
}

function DialOutStackView()
{
	return (
		<MainStack.Navigator headerMode="none">
			<MainStack.Screen name="DialOut" component={ DialOutScreen }/>
		</MainStack.Navigator>
	);
}

function ContactUsStackView()
{
	return (
		<MainStack.Navigator headerMode="none">
			<MainStack.Screen name="ContactUs" component={ ContactUsScreen }/>
		</MainStack.Navigator>
	);
}

const { Navigator, Screen }	= createDrawerNavigator();
const ForwardIcon			= () => ( <MaterialCommunityIcons name="chevron-right" color={ '#ffffff' } size={ 22 }/> );
const MessagesIcon			= () => ( <MaterialCommunityIcons name="message-text-outline" color={ '#ffffff' } size={ 22 }/> );
const OfficesIcon			= () => ( <MaterialCommunityIcons name="office-building" color={ '#ffffff' } size={ 22 }/> );
const ServicesIcon			= () => ( <MaterialCommunityIcons name="format-list-bulleted" color={ '#ffffff' } size={ 22 }/> );
const SettingsIcon			= () => ( <MaterialCommunityIcons name="cog" color={ '#ffffff' } size={ 22 }/> );
const DialOutIcon			= () => ( <MaterialCommunityIcons name="phone-outgoing-outline" color={ '#ffffff' } size={ 22 }/> );
const ContactUsIcon			= () => ( <MaterialCommunityIcons name="card-account-phone-outline" color={ '#ffffff' } size={ 22 }/> );

const Header = () => (
	<React.Fragment>
		<View style={ { height: 56, justifyContent: 'flex-end', alignItems: 'center', backgroundColor: BACKGROUND_COLOR } }>
			<Image source={ require( '../assets/images/funeral-call-logo.png' ) } style={ { height: 56, width: 150, resizeMode: 'contain' } }/>
		</View>
		<Divider/>
	</React.Fragment>
);

const Footer = ( navigation ) =>
{
	const context = useRef( useContext( StateContext ) );

	return(
		<React.Fragment>
			<Divider/>
			<View style={ { height: 56, justifyContent: 'center', alignItems: 'center', backgroundColor: PRIMARY_COLOR } }>
				<FCButton label={ 'Logout' } labelStyle={ { fontSize: 20 } } onPress={ () => onLogout( navigation, context ) }/>
			</View>
		</React.Fragment>
	);
};

const onLogout = ( navigation, context ) =>
{
	APIService( context.current )
		.logoutClientUser
		(
			context.current.user,
			function( response )
			{
				onLogoutClientUser( navigation );
			},
			function( error )
			{
				onLogoutClientUser( navigation );
			}
		);
};

const onLogoutClientUser = ( navigation ) =>
{
	PushNotification.setApplicationIconBadgeNumber( 0 );

	AsyncStorage.removeItem( USER, ( err ) => { navigation.replace( 'Splash' ); } );
};

const onDrawerNavigate = ( index, state, navigation ) =>
{
	if( index.row === state.index )
	{
		navigation.closeDrawer();

		navigation.replace( state.routeNames[index.row] );
	}
	else
	{
		navigation.navigate( state.routeNames[index.row] );
	}
};

const DrawerContent = ( { navigation, state } ) => (

	<Drawer header={ Header } footer={ () => <Footer { ...navigation } /> } selectedIndex={ new IndexPath( state.index ) } onSelect={ index => onDrawerNavigate( index, state, navigation ) }>
		<DrawerItem title="Messages" accessoryLeft={ MessagesIcon } accessoryRight={ ForwardIcon }/>
		<DrawerItem title="Services" accessoryLeft={ ServicesIcon } accessoryRight={ ForwardIcon }/>
		<DrawerItem title="Office Info" accessoryLeft={ OfficesIcon } accessoryRight={ ForwardIcon }/>
		<DrawerItem title="Settings" accessoryLeft={ SettingsIcon } accessoryRight={ ForwardIcon }/>
		<DrawerItem title="Dial Out" accessoryLeft={ DialOutIcon } accessoryRight={ ForwardIcon }/>
		<DrawerItem title="Contact Us" accessoryLeft={ ContactUsIcon } accessoryRight={ ForwardIcon }/>
	</Drawer>
);

export default function MainScreen( { navigation, route } )
{
	const context = useRef( useContext( StateContext ) );

	useEffect( () =>
	{
		const msgID = getMessageId();

		// If msgID, we were launched from a notification ...
		if( msgID !== null )
		{
			setMessageId( null );

			setTimeout( () => { navigation.replace( 'Messages', { msgID: msgID } ); }, 1000 );
		}

		PubSub.subscribe( ( data ) =>
		{
			if( parseFloat( data ) > 0 )
			{
				onNotificationHandler( data );
			}
			else if( parseFloat( data ) === -99 )
			{
				onLogout( navigation, context );
			}
		} );

	}, [] );

	const onNotificationHandler = ( msgID ) => { navigation.replace( 'Messages', { msgID: msgID } ); };

	return (
		<SafeAreaView style={ { flex: 1, backgroundColor: BACKGROUND_COLOR } }>
			<Navigator drawerContent={ props => <DrawerContent { ...props }/> }>
				<Screen name="Messages" component={ MessagesStackView } options={ { unmountOnBlur: true, swipeEnabled: false } }/>
				<Screen name="Services" component={ ServicesStackView } options={ { unmountOnBlur: true } }/>
				<Screen name="OfficeInfo" component={ OfficesStackView } options={ { unmountOnBlur: true } }/>
				<Screen name="Settings" component={ SettingsStackView } options={ { unmountOnBlur: true } }/>
				<Screen name="DialOut" component={ DialOutStackView } options={ { unmountOnBlur: true } }/>
				<Screen name="ContactUs" component={ ContactUsStackView } options={ { unmountOnBlur: true } }/>
			</Navigator>
		</SafeAreaView>
	);
}
