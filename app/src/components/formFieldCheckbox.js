import React from 'react';
import { BACKGROUND_COLOR } from '../constants';
import { View } from 'react-native';
import {CheckBox, Text} from '@ui-kitten/components';

const FormFieldCheckbox = props =>
{
	const onChange = ( checked ) => { props.onChange && props.onChange( checked ); };

	return (
		<View style={ { margin: 5, marginStart: 10, marginEnd: 10, marginTop: 10 } }>
            <CheckBox checked={ props.value } onChange={ checked => onChange( checked ) }>
                { evaProps => <Text { ...evaProps } style={ { fontFamily: 'OpenSans-Bold', fontSize: 18, color: BACKGROUND_COLOR, marginStart: 10 } }>{ props.label }</Text> }
            </CheckBox>
		</View>
	);
};

export default FormFieldCheckbox;
