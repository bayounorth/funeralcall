import React from 'react';
import { View } from 'react-native';
import DialogBaseModal from './dialogBaseModal';
import FCLabel from '../components/fcLabel';
import FCButton from '../components/fcButton';
import { NEGATIVE_COLOR, PRIMARY_COLOR } from '../constants';

const DialogOKCancel = props =>
{
	const onCancelPress	= () => { props.onCancelPress && props.onCancelPress(); };
	const onOKPress		= () => { props.onOKPress && props.onOKPress(); };

	return (
		<DialogBaseModal visible={ props.visible }>
			<View style={ {  } }>
				<FCLabel label={ props.message } labelStyle={ { fontFamily: 'OpenSans-Regular', fontSize: 20, color: '#ffffff', textAlign: 'center' } } />
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

export default DialogOKCancel;
