import React from 'react';
import FCLabel from './fcLabel';
import FieldText from './fieldText';
import { BACKGROUND_COLOR } from '../constants';
import { View } from 'react-native';

const FormFieldText = props =>
{
	const onChangeText = ( text ) => { props.onChangeText && props.onChangeText( text ); };

	return (
		<View style={ { margin: 5, marginStart: 10, marginEnd: 10 } }>
			<FCLabel label={ props.label } labelStyle={ { fontFamily: 'OpenSans-Bold', fontSize: 18, color: BACKGROUND_COLOR, marginBottom: 4, marginStart: 2 } }/>
			<FieldText viewStyle={ { backgroundColor: BACKGROUND_COLOR, height: props.multiline ? 200 : 40 } } textInputStyle={ { color: '#ffffff', textAlignVertical: props.multiline ? 'top' : 'auto', paddingTop: props.multiline ? 10 : 0, paddingBottom: props.multiline ? 10 : 0 } } placeholderTextColor={ '#ffffff' } props={ { placeholder: props.placeholder ? props.placeholder : props.label, editable: props.editable, multiline: props.multiline, keyboardType: props.keyboardType ? props.keyboardType : 'default' } } value={ props.value } onChangeText={ text => { onChangeText( text ); } }/>
		</View>
	);
};

export default FormFieldText;
