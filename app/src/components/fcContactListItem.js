import React from 'react';
import { Pressable, View } from 'react-native';
import FCLabel from './fcLabel';
import {BACKGROUND_COLOR, stringHasValue} from '../constants';

const FCContactListItem = props =>
{
	const onPress = () => { props.onPress && props.onPress(); };

	return (
		<Pressable style={ { backgroundColor: '#FFFFFF' } } onPress={ () => onPress() }>
			<View style={ { padding: 5 } }>
				{ stringHasValue( props.displayName ) && <FCLabel label={ props.displayName } labelStyle={ { color: '#424242', fontSize: 20 } }/> }
				{ stringHasValue( props.email ) && <FCLabel label={ props.email } labelStyle={ { color: '#424242', fontSize: 16 } }/> }
				{ stringHasValue( props.phoneNum ) && <FCLabel label={ props.phoneNum } labelStyle={ { color: '#424242', fontSize: 16 } }/> }
			</View>
			<View style={ { height: 1, backgroundColor: BACKGROUND_COLOR } } />
		</Pressable>
	);
};

export default FCContactListItem;
