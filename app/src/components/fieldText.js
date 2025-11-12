import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { BACKGROUND_COLOR } from '../constants';

const FieldText = props =>
{
	const onChangeText = ( text ) => { props.onChangeText && props.onChangeText( text ); };

	return (
		<View style={ { ...styles.view, ...props.viewStyle } }>
			<TextInput ref={ ( input ) => props.inputRef && props.inputRef( input ) } style={ { ...styles.textInput, ...props.textInputStyle } } placeholderTextColor={ props.placeholderTextColor ? props.placeholderTextColor : BACKGROUND_COLOR } { ...props.props } value={ props.value } onChangeText={ text => onChangeText( text ) }/>
		</View>
	);
};

const styles = StyleSheet.create( {
	view: {
		borderRadius:       5,
		backgroundColor:    '#ffffff',
		height:				40,
		alignItems:			'flex-start',
		justifyContent:		'center',
		paddingLeft:		15,
		paddingRight:		15
	},
	textInput: {
		padding:			0,
		margin:				0,
		color:				'#000000',
		fontFamily:			'OpenSans-Regular',
		fontSize:			18,
		fontStyle:			'normal',
		textAlign:			'left',
		width:				'100%',
		height:				'100%'
	}
} );

export default FieldText;
