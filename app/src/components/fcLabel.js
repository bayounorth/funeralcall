import React from 'react';
import { StyleSheet, Text } from 'react-native';

const FCLabel = props =>
{
	return (
		<Text style={ { ...styles.label, ...props.labelStyle } } { ...props }>{ props.label }</Text>
	);
};

const styles = StyleSheet.create( {
	label: {
		color:			'#ffffff',
		fontFamily:		'OpenSans-Regular',
		fontSize:		16,
		textAlign:		'left'
	}
} );

export default FCLabel;
