import React from 'react';
import { StyleSheet, Pressable } from 'react-native';
import FCLabel from './fcLabel';

const FCButton = props =>
{
	const onPress = () => { props.onPress && props.onPress(); };

	const defaultButtonStyle = ( props.disabled === true ) ? { ...styles.button, ...styles.disabled } : { ...styles.button };

	return (
		<Pressable style={ { ...styles.button, ...defaultButtonStyle, ...props.buttonStyle } } disabled={ props.disabled } onPress={ () => onPress() }>
			<FCLabel label={ props.label } labelStyle={ { ...styles.label, ...props.labelStyle } }/>
		</Pressable>
	);
};

const styles = StyleSheet.create( {
	button: {
		height:			40,
		borderRadius:	5,
		alignItems:		'center',
		justifyContent:	'center'
	},
	label: {},
	disabled: {
		opacity: 0.5
	}
} );

export default FCButton;
