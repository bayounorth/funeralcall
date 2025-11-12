import React, { useEffect } from 'react';
import {StatusBar, View, Text, TextInput} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import crashlytics from '@react-native-firebase/crashlytics';
import PushNotification, { Importance } from 'react-native-push-notification';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ApplicationProvider, IconRegistry } from '@ui-kitten/components';
import { default as theme } from './theme.json';
import { default as mapping } from './mapping.json';
import * as eva from '@eva-design/eva';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import SplashScreen from './screens/splash';
import { PubSub, StateProvider } from './services/stateService';
import { BACKGROUND_COLOR, isAndroid, isIos, SOUNDS } from './constants';
import LoginScreen from './screens/login';
import ForgotPasswordScreen from './screens/forgotPassword';
import MainScreen from './screens/main';

const Stack = createStackNavigator();

const App = () =>
{
	useEffect( () =>
	{
		// Ignore dynamic type scaling on iOS
		Text.defaultProps 		= Text.defaultProps || {};
		TextInput.defaultProps 	= TextInput.defaultProps || {};

		Text.defaultProps.allowFontScaling 			= false;
		TextInput.defaultProps.allowFontScaling 	= false;

		PubSub.publish = ( data ) => PubSub.next( data );

		for( let i = 0; i < SOUNDS.length; i++ )
		{
			const sound		= SOUNDS[i];
			const channel	= {
								channelId:		sound.id,
								channelName:	sound.id,
								playSound:		true,
								soundName: 		sound.id,
								importance:		Importance.HIGH,
								vibrate:		true
							  };

			PushNotification.createChannel( channel, ( created ) => console.log( `createChannel returned '${ created }'` ) );
		}

		// IOS		-> {
		//   "data": {
		//     "msgId": "-98"
		//   },
		//   "messageId": "1635505916906609",
		//   "notification": {
		//     "body": "3rd new test",
		//     "ios": {
		//       "badge": 0
		//     },
		//     "sound": "generalmessage.caf",
		//     "title": "FuneralCall Support Test"
		//   }
		// }
		// Android	-> {
		//   "collapseKey": "com.omnienterprises.funeralcall",
		//   "data": {
		//     "messageCount": "0",
		//     "msgId": "-98"
		//   },
		//   "from": "590634795311",
		//   "messageId": "0:1635509489320981%20dab49320dab493",
		//   "notification": {
		//     "android": {
		//       "channelId": "generalmessage",
		//       "sound": "generalmessage"
		//     },
		//     "body": "test foreground",
		//     "title": "FuneralCall Support Test"
		//   },
		//   "sentTime": 1635509489312,
		//   "ttl": 2419200
		// }

		const unsubscribe = messaging().onMessage( async remoteMessage =>
		{
			console.log( 'app.js - onMessage' );
			console.log( remoteMessage );
			crashlytics().log( remoteMessage );

			const msgId = parseFloat( remoteMessage.data.msgId );

			if( msgId === -99 ){ return; } // Logout notification...

			const	messageCount	= parseFloat( remoteMessage.data.messageCount );
			const	body			= remoteMessage.notification.body;
			const	title			= remoteMessage.notification.title;
			let		sound			= '';

			if( isIos )
			{
				sound = remoteMessage.notification.sound;
			}
			else
			{
				sound = remoteMessage.notification.android.sound;
			}

			let notification = {
				number:		messageCount,
				autoCancel:	false,
				title:		title,
				message:	body,
				soundName:	sound,
				playSound:	true,
				userInfo:	{ msgId: msgId.toString( 10 ) } };

			if( isAndroid )
			{
				notification.channelId = remoteMessage.notification.android.channelId;
			}

			PushNotification.setApplicationIconBadgeNumber( messageCount );
			PushNotification.localNotification( notification );
		} );

		if( isAndroid )
		{
			messaging().registerDeviceForRemoteMessages().then( function(){} );
		}

		return unsubscribe;

	}, [] );

	return (
		<View style={ { flex: 1, backgroundColor: BACKGROUND_COLOR } }>
			<IconRegistry icons={ EvaIconsPack }/>
			<ApplicationProvider { ...eva } customMapping={ mapping } theme={ { ...eva.dark, ...theme } }>
				<StatusBar backgroundColor={ BACKGROUND_COLOR }/>
				<StateProvider>
					<NavigationContainer>
						<Stack.Navigator screenOptions={ { cardStyle: { backgroundColor: 'transparent' }, animationEnabled: false } } initialRouteName="Splash">
							<Stack.Screen name="Splash" component={ SplashScreen } options={ { headerShown: false } }/>
							<Stack.Screen name="Login" component={ LoginScreen } options={ { headerShown: false } }/>
							<Stack.Screen name="ForgotPassword" component={ ForgotPasswordScreen } options={ { headerShown: false } }/>
							<Stack.Screen name="Main" component={ MainScreen } options={ { headerShown: false } }/>
						</Stack.Navigator>
					</NavigationContainer>
				</StateProvider>
			</ApplicationProvider>
		</View>
	);
};

export default App;
