import {AppRegistry} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import App from './src/App';
import {name as appName} from './app.json';
import PushNotification from 'react-native-push-notification';
import { isIos } from './src/constants';
import crashlytics from '@react-native-firebase/crashlytics';
import {PubSub, setMessageId} from './src/services/stateService';
import PushNotificationIOS from '@react-native-community/push-notification-ios';

// IOS ->
/*
index.js - onNotification
[Fri Oct 29 2021 07:10:29.839]  LOG      {"action": undefined, "badge": 0, "data": {"gcm.message_id": "1635505825597089", "google.c.a.e": "1", "google.c.fid": "fwR54uXMY0sqqHZpRaZkv2", "google.c.sender.id": "590634795311", "msgId": "-98", "remote": true, "userInteraction": 1}, "finish": [Function finish], "foreground": false, "id": undefined, "message": "New Test Background", "reply_text": undefined, "soundName": "generalmessage.caf", "subtitle": undefined, "title": "FuneralCall Support Test", "userInteraction": true}
{
  "action": "undefined",
  "badge": 0,
  "data": {
    "gcm.message_id": "1635505825597089",
    "google.c.a.e": "1",
    "google.c.fid": "fwR54uXMY0sqqHZpRaZkv2",
    "google.c.sender.id": "590634795311",
    "msgId": "-98",
    "remote": true,
    "userInteraction": 1
  },
  "finish": "",
  "foreground": false,
  "id": "undefined",
  "message": "New Test Background",
  "reply_text": "undefined",
  "soundName": "generalmessage.caf",
  "subtitle": "undefined",
  "title": "FuneralCall Support Test",
  "userInteraction": true
}

index.js - onNotification
[Fri Oct 29 2021 07:11:29.374]  LOG      {"action": "com.apple.UNNotificationDefaultActionIdentifier", "badge": undefined, "data": {"actionIdentifier": "com.apple.UNNotificationDefaultActionIdentifier", "aps": {"alert": [Object], "badge": 0, "sound": "generalmessage.caf"}, "gcm.message_id": "1635505886739751", "google.c.a.e": "1", "google.c.fid": "fwR54uXMY0sqqHZpRaZkv2", "google.c.sender.id": "590634795311", "msgId": "-98", "userInteraction": 1}, "finish": [Function finish], "foreground": false, "id": undefined, "message": "2nd new test", "reply_text": undefined, "soundName": undefined, "subtitle": null, "title": "FuneralCall Support Test", "userInteraction": true}

{
  "action": "com.apple.UNNotificationDefaultActionIdentifier",
  "badge": "undefined",
  "data": {
    "actionIdentifier": "com.apple.UNNotificationDefaultActionIdentifier",
    "aps": {
      "alert": "[Object]",
      "badge": 0,
      "sound": "generalmessage.caf"
    },
    "gcm.message_id": "1635505886739751",
    "google.c.a.e": "1",
    "google.c.fid": "fwR54uXMY0sqqHZpRaZkv2",
    "google.c.sender.id": "590634795311",
    "msgId": "-98",
    "userInteraction": 1
  },
  "finish": "[Function finish]",
  "foreground": false,
  "id": "undefined",
  "message": "2nd new test",
  "reply_text": "undefined",
  "soundName": "undefined",
  "subtitle": null,
  "title": "FuneralCall Support Test",
  "userInteraction": true
}

app.js - onMessage
[Fri Oct 29 2021 07:11:57.620]  LOG      {"data": {"msgId": "-98"}, "messageId": "1635505916906609", "notification": {"body": "3rd new test", "ios": {"badge": 0}, "sound": "generalmessage.caf", "title": "FuneralCall Support Test"}}

*/

// Android ->
/*
index.js - setBackgroundMessageHandler
[Fri Oct 29 2021 08:00:30.939]  LOG      {"collapseKey": "com.omnienterprises.funeralcall", "data": {"msgId": "-98"}, "from": "590634795311", "messageId": "0:1635508825294014%20dab49320dab493", "notification": {"android": {"channelId": "generalmessage", "sound": "generalmessage"}, "body": "test background", "title": "FuneralCall Support Test"}, "sentTime": 1635508825285, "ttl": 2419200}

index.js - setBackgroundMessageHandler
[Fri Oct 29 2021 08:02:53.290]  LOG      {"collapseKey": "com.omnienterprises.funeralcall", "data": {"msgId": "-98"}, "from": "590634795311", "messageId": "0:1635508969978039%20dab49320dab493", "notification": {"android": {"channelId": "generalmessage", "sound": "generalmessage"}, "body": "test background", "title": "FuneralCall Support Test"}, "sentTime": 1635508969970, "ttl": 2419200}

app.js - onMessage
[Fri Oct 29 2021 08:03:32.803]  LOG      {"collapseKey": "com.omnienterprises.funeralcall", "data": {"msgId": "-98"}, "from": "590634795311", "messageId": "0:1635509011401813%20dab49320dab493", "notification": {"android": {"channelId": "generalmessage", "sound": "generalmessage"}, "body": "test foreground", "title": "FuneralCall Support Test"}, "sentTime": 1635509011393, "ttl": 2419200}
 */

messaging().setBackgroundMessageHandler( async remoteMessage => {

	console.log( 'index.js - setBackgroundMessageHandler' );
	console.log( remoteMessage );
	crashlytics().log( remoteMessage );

	if( parseFloat( remoteMessage.data.msgId ) === -99 ){ return; } // Logout notification...

	let notification = { number: parseFloat( remoteMessage.data.messageCount ), autoCancel: false, channelId: remoteMessage.data.sound, title: remoteMessage.data.title, message: remoteMessage.data.body, soundName: remoteMessage.data.sound, playSound: true, userInfo: { msgId: remoteMessage.data.msgId } };

	if( isIos )
	{
		notification.soundName = remoteMessage.data.sound + '.caf';
	}

	if( !remoteMessage.notification )
	{
		PushNotification.setApplicationIconBadgeNumber( parseFloat( remoteMessage.data.messageCount ) );
		PushNotification.localNotification( notification );
	}
} );

PushNotification.configure
(
	{
		onNotification: function( notification )
		{
			console.log( 'index.js - onNotification' );
			console.log( notification );

			if( parseFloat( notification.data.msgId ) > 0 )
			{
				setMessageId( notification.data.msgId );
			}

			if( ( PubSub ) && ( PubSub.publish ) )
			{
				PubSub.publish( notification.data.msgId );
			}

			notification.finish( PushNotificationIOS.FetchResult.NoData );
		}
	}
);

AppRegistry.registerComponent( appName, () => App );
