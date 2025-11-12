import React from 'react';
import { View } from 'react-native';
import { PRIMARY_COLOR } from '../constants';
import FCLabel from './fcLabel';

const FCHeader = props =>
{
	return (
		<View style={ { height: 45, backgroundColor: PRIMARY_COLOR, justifyContent: 'center', alignItems: 'center' } }>
			<FCLabel label={ props.title } labelStyle={ { fontSize: 26, fontFamily: 'OpenSans-Bold' } }/>
		</View>
	);
};

export default FCHeader;
