import React from 'react';
import FCLabel from './fcLabel';
import {BACKGROUND_COLOR, toMomentOrToday} from '../constants';
import { View } from 'react-native';
import {Datepicker} from '@ui-kitten/components';
import {MomentDateService} from '@ui-kitten/moment';

const FormFieldDate = props =>
{
	const dateService = new MomentDateService();

	const onSelect = ( nextDate ) => { props.onSelect && props.onSelect( nextDate ); };

	return (
		<View style={ { margin: 5, marginStart: 10, marginEnd: 10 } }>
			<FCLabel label={ props.label } labelStyle={ { fontFamily: 'OpenSans-Bold', fontSize: 18, color: BACKGROUND_COLOR, marginBottom: 4, marginStart: 2 } }/>
            <Datepicker placeholder={ props.label } date={ toMomentOrToday( props.value ) } dateService={ dateService } onSelect={ nextDate => onSelect( nextDate ) }/>
		</View>
	);
};

export default FormFieldDate;
