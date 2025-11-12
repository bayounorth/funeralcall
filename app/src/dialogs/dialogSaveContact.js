import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import DialogBaseModal from './dialogBaseModal';
import FCLabel from '../components/fcLabel';
import FCButton from '../components/fcButton';
import { NEGATIVE_COLOR, PRIMARY_COLOR } from '../constants';
import FieldText from '../components/fieldText';

const DialogSaveContact = props =>
{
	const [ firstName, setFirstName ]	= useState( null );
	const [ lastName, setLastName ]		= useState( null );
	const [ phone, setPhone ]			= useState( null );
	const [ altPhone, setAltPhone ]		= useState( null );

	const onCancelPress	= () => { props.onCancelPress && props.onCancelPress(); };
	const onOKPress		= () => { props.onOKPress && props.onOKPress( { firstName: firstName, lastName: lastName, phone: phone, altPhone: altPhone } ); };

	useEffect( () =>
	{
		if( props.firstName ){ setFirstName( props.firstName ); }
		if( props.lastName ){ setLastName( props.lastName ); }
		if( props.phone ){ setPhone( props.phone ); }
		if( props.altPhone ){ setAltPhone( props.altPhone ); }

	}, [ props ] );

	return (
		<DialogBaseModal visible={ props.visible }>
			<View style={ {  } }>
				<FCLabel label={ 'Save This Contact?' } labelStyle={ { fontFamily: 'OpenSans-Regular', fontSize: 20, color: '#ffffff', textAlign: 'center', marginBottom: 10 } } />

				<FCLabel label={ 'First Name' } labelStyle={ { fontFamily: 'OpenSans-Regular', fontSize: 16, color: '#ffffff' } }/>
				<FieldText viewStyle={ { width: '100%', marginBottom: 10 } } props={ { placeholder: 'First Name' } } value={ firstName } onChangeText={ text => { setFirstName( text ); } }/>

				<FCLabel label={ 'Last Name' } labelStyle={ { fontFamily: 'OpenSans-Regular', fontSize: 16, color: '#ffffff' } }/>
				<FieldText viewStyle={ { width: '100%', marginBottom: 10 } } props={ { placeholder: 'Last Name' } } value={ lastName } onChangeText={ text => { setLastName( text ); } }/>

				<FCLabel label={ 'Phone' } labelStyle={ { fontFamily: 'OpenSans-Regular', fontSize: 16, color: '#ffffff' } }/>
				<FieldText viewStyle={ { width: '100%', marginBottom: 10 } } props={ { placeholder: 'Phone' } } value={ phone } onChangeText={ text => { setPhone( text ); } }/>

				<FCLabel label={ 'Alt Phone' } labelStyle={ { fontFamily: 'OpenSans-Regular', fontSize: 16, color: '#ffffff' } }/>
				<FieldText viewStyle={ { width: '100%' } } props={ { placeholder: 'Alt Phone' } } value={ altPhone } onChangeText={ text => { setAltPhone( text ); } }/>

				<View style={ { justifyContent: 'center', alignItems: 'center', flexDirection: 'row', marginTop: 20 } }>
					<FCButton label={ 'CANCEL' } buttonStyle={ { flex: 1, backgroundColor: NEGATIVE_COLOR } } onPress={ () => onCancelPress() }/>
					<View style={ { width: 15 } } />
					<FCButton label={ 'SAVE' } buttonStyle={ { flex: 1, backgroundColor: PRIMARY_COLOR } } onPress={ () => onOKPress() }/>
				</View>
			</View>
		</DialogBaseModal>
	);
};

export default DialogSaveContact;
