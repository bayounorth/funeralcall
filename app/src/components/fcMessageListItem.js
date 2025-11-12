import React, { useEffect, useState } from 'react';
import { View, Pressable } from 'react-native';
import FCLabel from './fcLabel';
import { Icon } from '@ui-kitten/components';
import {PRIMARY_COLOR, stringHasValue, TRANSPARENT_COLOR} from '../constants';

const FCMessageListItem = props =>
{
	const [ isChecked, setIsChecked ]				= useState( false );
	const [ backgroundColor, setBackgroundColor]	= useState( '#FFFFFF' );
	const [ textColor, setTextColor]				= useState( '#424242' );

	useEffect( () =>
	{
		if( !props.isEditMode )
		{
			setIsChecked( false );
		}

	}, [ props.isEditMode ] );

	useEffect( () =>
	{
		if( !props.isRead )
		{
			setBackgroundColor( PRIMARY_COLOR );
			setTextColor( '#FFFFFF' );
		}
		else
		{
			setBackgroundColor( '#FFFFFF' );
			setTextColor( '#424242' );
		}

	}, [ props.isRead ] );

	const onPress = () =>
	{
		let checked = isChecked;

		if( props.isEditMode )
		{
			checked = !checked;

			setIsChecked( checked );
		}

		props.onPress && props.onPress( checked );
	};

	return (
		<Pressable style={ { flexDirection: 'row', alignItems: 'center', marginTop: 10 } } onPress={ () => onPress() }>

			{ props.addIndicator &&
				<>
				{ !props.isEditMode &&
					<>
						{ props.indicatorColor !== PRIMARY_COLOR && <View style={ { backgroundColor: props.indicatorColor, height: 20, width: 20, borderRadius: 30, marginStart: 10 } }/> }
						{ props.indicatorColor === PRIMARY_COLOR && <View style={ { backgroundColor: TRANSPARENT_COLOR, height: 20, width: 20, borderRadius: 30, marginStart: 10 } }/> }
					</>
				}
				{ props.isEditMode &&
					<View style={ { borderColor: PRIMARY_COLOR, height: 20, width: 20, borderRadius: 30, marginStart: 10, borderWidth: 1, justifyContent: 'center', alignItems: 'center' } }>
						{ isChecked && <Icon name="checkmark-outline" fill="#ffffff" style={ { height: 15, width: 15 } }/> }
					</View>
				}
				</>
			}

			<View style={ { flex: 1, backgroundColor: backgroundColor, borderRadius: 10, marginStart: props.addIndicator ? 10 : 20, marginEnd: 20 } }>
				<View style={ { flex: 1, flexDirection: 'row', padding: 15, paddingRight: 5, justifyContent: 'center', alignItems: 'center' } }>
					<View style={ { flex: 1, justifyContent: 'center' } }>
						<FCLabel label={ props.title } labelStyle={ { color: textColor, fontSize: 20, ...props.titleStyle } }/>
						{ stringHasValue( props.subTitle ) && <FCLabel label={ props.subTitle } labelStyle={ { color: textColor, fontSize: 18, ...props.subTitleStyle } }/> }
						{ stringHasValue( props.dateTime ) && <FCLabel label={ props.dateTime } labelStyle={ { color: textColor, fontSize: 16 } }/> }
						{ stringHasValue( props.message ) && <FCLabel label={ props.message } labelStyle={ { color: textColor, fontSize: 16 } }/> }
					</View>
					<Icon name="arrow-ios-forward-outline" fill={ textColor } style={ { height: 36, width: 36 } }/>
				</View>
			</View>
		</Pressable>
	);
};

export default FCMessageListItem;
