import React from 'react';
import { View } from 'react-native';
import DialogBaseModal from './dialogBaseModal';
import FCLabel from '../components/fcLabel';
import FCButton from '../components/fcButton';
import {formatPhoneNumber, NEGATIVE_COLOR, PRIMARY_COLOR} from '../constants';

const DialogCallPrompt = props =>
{
	const onCellNumberPress		= ()	=> { props.onCellNumberPress && props.onCellNumberPress(); };
	const onOfficeNumberPress	= ()	=> { props.onOfficeNumberPress && props.onOfficeNumberPress(); };
	const onCancelPress			= ()	=> { props.onCancelPress && props.onCancelPress(); };

	return (
		<DialogBaseModal visible={ props.visible }>
			<View style={ {  } }>
				<FCLabel label={ 'Call Contact?' } labelStyle={ { fontFamily: 'OpenSans-Bold', fontSize: 20, color: '#ffffff', textAlign: 'center' } } />

				<FCLabel label={ 'NOTE: If choosing an office number, the system will present a live call to your device from that number. Please accept that call and you will be connected to the “Number To Call”. If you reject the call, the system will still dial the “Number To Call” and the call recipient will receive your device voicemail. ' } labelStyle={ { fontFamily: 'OpenSans-Bold', fontSize: 14, textAlign: 'center', margin: 10 } } />

				<FCLabel label={ 'Select Your Outbound Caller ID' } labelStyle={ { fontFamily: 'OpenSans-Regular', fontSize: 18, color: '#ffffff', textAlign: 'center' } }/>
				<View style={ { justifyContent: 'center', alignItems: 'center', width: '100%', marginTop: 15 } }>
					{ props.cellPhone && <FCButton label={ 'Use cell phone\n' + formatPhoneNumber( props.cellPhone ) } labelStyle={ { fontSize: 18, textAlign: 'center' } } buttonStyle={ { width: '100%', backgroundColor: PRIMARY_COLOR, height: 55 } } onPress={ () => onCellNumberPress() }/> }

					{ props.cellPhone && props.officeNumber && <View style={ { height: 10 } }/> }

					{ props.cellPhone && props.officeNumber && <FCButton label={ 'Use office number\n' + formatPhoneNumber( props.officeNumber ) } labelStyle={ { fontSize: 18, textAlign: 'center' } } buttonStyle={ { width: '100%', backgroundColor: PRIMARY_COLOR, height: 55 } } onPress={ () => onOfficeNumberPress() }/> }

					<View style={ { height: 20 } }/>

					<FCButton label={ 'CANCEL' } labelStyle={ { fontSize: 18, textAlign: 'center' } } buttonStyle={ { width: '100%', backgroundColor: NEGATIVE_COLOR } } onPress={ () => onCancelPress() }/>
				</View>
			</View>
		</DialogBaseModal>
	);
};

export default DialogCallPrompt;
