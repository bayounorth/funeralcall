import React from 'react';
import { View, StyleSheet } from 'react-native';
import Modal from 'react-native-translucent-modal';
import { BACKGROUND_COLOR } from '../constants';

const DialogBaseModal = props =>
{
	return (
		<Modal transparent={ true } animationType="slide" visible={ props.visible } onRequestClose={ () => {} }>
			<View style={ styles.modalBackground }>
				<View style={ { width: '80%', backgroundColor: BACKGROUND_COLOR, borderRadius: 10, padding: 15 } }>
					{ props.children }
				</View>
			</View>
		</Modal>
	);
};

const styles = StyleSheet.create( {
	modalBackground: {
		flex:				1,
		alignItems:			'center',
		flexDirection:		'column',
		justifyContent:		'space-around',
		backgroundColor:	'#0000007f',
		width:				'100%'
	}
} );

export default DialogBaseModal;
