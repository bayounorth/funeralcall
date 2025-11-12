import React, { useState } from 'react';
import { View } from 'react-native';
import DialogBaseModal from './dialogBaseModal';
import FCLabel from '../components/fcLabel';
import FCButton from '../components/fcButton';
import { NEGATIVE_COLOR, PRIMARY_COLOR } from '../constants';
import FieldText from '../components/fieldText';

const DialogInput = props =>
{
	const [ dialogInput, setDialogInput ] = useState( null );

	const onCancelPress	= () => { props.onCancelPress && props.onCancelPress(); };
	const onOKPress		= () => { props.onOKPress && props.onOKPress( dialogInput ); };

	return (
		<DialogBaseModal visible={ props.visible }>
			<View style={ {  } }>
				<FCLabel label={ props.message } labelStyle={ { fontFamily: 'OpenSans-Regular', fontSize: 20, color: '#ffffff', textAlign: 'center' } } />
				<FieldText viewStyle={ { width: '100%', marginTop: 10, justifyContent: props.multiline ? 'flex-start' : 'center', height: props.multiline ? ( 45 * 2 ) : 45 } } props={ { placeholder: props.placeholder, multiline: props.multiline } } value={ dialogInput } onChangeText={ text => { setDialogInput( text ); } }/>
				<View style={ { justifyContent: 'center', alignItems: 'center', flexDirection: 'row', marginTop: 15 } }>
					{ props.showCancelButton &&
						<>
							<FCButton label={ 'CANCEL' } buttonStyle={ { flex: 1, backgroundColor: NEGATIVE_COLOR } } onPress={ () => onCancelPress() }/>
							<View style={ { width: 15 } } />
						</>
					}
					<FCButton label={ 'OK' } buttonStyle={ { flex: 1, backgroundColor: PRIMARY_COLOR } } onPress={ () => onOKPress() }/>
				</View>
			</View>
		</DialogBaseModal>
	);
};

export default DialogInput;
