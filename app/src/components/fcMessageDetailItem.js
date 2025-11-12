import React from 'react';
import { View } from 'react-native';
import FCLabel from './fcLabel';
import FCLink from './fcLink';
import { PRIMARY_COLOR } from '../constants';

const FCMessageDetailItem = props =>
{
	const onPress = () =>
	{
		props.onPress && props.onPress( props.link );
	};

	return (
		<View style={ { marginStart: 20, marginEnd: 20, marginTop: 10, marginBottom: 10, ...props.viewStyle } }>
			{ props.title &&
				<FCLabel label={ props.title } labelStyle={ { color: '#000000', fontFamily: 'OpenSans-Bold', fontSize: 20 } }/>
			}
			{ props.message &&
				<>
					{ !props.link && <FCLabel label={ props.message } labelStyle={ { color: '#000000', fontSize: 16 } }/> }
					{ props.link && <FCLink label={ props.message } labelStyle={ { color: PRIMARY_COLOR, fontFamily: 'OpenSans-Bold', fontSize: 18 } } buttonStyle={ { alignItems: 'flex-start' } } onPress={ () => onPress() }/> }
				</>
			}
		</View>
	);
};

export default FCMessageDetailItem;
