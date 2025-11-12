import React from 'react';
import { StyleSheet } from 'react-native';
import FCButton from './fcButton';

const FCLink = props =>
{
	const onPress = () => { props.onPress && props.onPress(); };

	return (
		<FCButton buttonStyle={ { ...styles.button, ...props.buttonStyle } } label={ props.label } labelStyle={ { ...styles.label, ...props.labelStyle } } onPress={ () => onPress() }/>
	);
};

const styles = StyleSheet.create( {
	button: {
		height:				25,
		borderRadius:		0,
		alignItems:			'center',
		justifyContent:		'center'
	},
	label: {
		fontSize:			16,
		textDecorationLine:	'underline'
	}
} );

export default FCLink;
