import React, { useContext, useEffect, useRef, useState } from 'react';
import APIService from '../services/apiService';
import { StateContext } from '../services/stateService';
import { BACKGROUND_COLOR, ERROR_COLOR, PRIMARY_COLOR } from '../constants';
import FCTopNavigation from '../components/fcTopNavigation';
import FCHeader from '../components/fcHeader';
import {KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, View} from 'react-native';
import FCButton from '../components/fcButton';
import FormFieldText from '../components/formFieldText';
import {Formik} from 'formik';
import FormFieldCheckbox from '../components/formFieldCheckbox';
import FormFieldDate from '../components/formFieldDate';
import FormFieldSelect from '../components/formFieldSelect';
import DialogOKCancel from '../dialogs/dialogOKCancel';
import Toast from 'react-native-simple-toast';

export default function ServiceDetailScreen( { route, navigation } )
{
	const context														= useRef( useContext( StateContext ) );
	const [ fields, setFields ]											= useState( [] );
	const [ service, setService ]										= useState( {} );
	const [ modalDeleteConfirmVisible, setModalDeleteConfirmVisible ]	= useState( false );

	const BackButton						= ( props )	=> ( <FCButton { ...props } label={ '< Back' } labelStyle={ { fontSize: 22, marginLeft: 10 } } onPress={ onBackButtonPress }/> );
	const onBackButtonPress					= ()		=> { navigation.replace( 'Services' ); };
	const onDelete							= ()		=> { setModalDeleteConfirmVisible( true ); };
	const onCancelDeleteMessageDialogPress	= ()		=> { setModalDeleteConfirmVisible( false ); };

	useEffect( () =>
	{
		APIService( context.current ).getObituaryColumns( function( obituaryColumnsData )
		{
			setFields( obituaryColumnsData );

			if ( !route.params || !route.params.id ){ return; }

			APIService( context.current ).getObituary( route.params.id, function( obituaryData )
			{
				setService( obituaryData );
			} );
		} );

	}, [ route.params ] );

	const renderFormElements = ( props ) =>
	{
		let elements = [];

		for( let i = 0; i < fields.length; i++ )
		{
			const	field	= fields[i];
			let     label   = field.column_name;

            if( field.is_identity === true ){ continue; }
            if( field.is_editable !== true ){ continue; }

			if( ( field.column_description ) && ( field.column_description.length > 0 ) )
			{
				label = field.column_description;
			}

			// Is this field conditionally displayed ...
            if( ( field.display_when ) && ( field.display_when.length > 0 ) )
            {
                const   display_rules = field.display_when.split( '=' );
                const   field_name    = display_rules[0];
                const   field_value   = display_rules[1];
                let     field_hidden    = true;

                if( service.hasOwnProperty( field_name ) === true )
                {
                    if( service[field_name] !== null )
                    {
                        if( field_value.toLowerCase() === service[field_name].toLowerCase() )
                        {
                            field_hidden = false;
                        }
                    }
                }

                if( field_hidden === true ){ continue; }
            }

            if( ( field.options ) && ( field.options.length > 0 ) )
			{
				const   field_options   = field.options.split( ',' );
                let     options         = [];

                for( let j = 0; j < field_options.length; j++ )
                {
                    const option = field_options[j].trim();

                    options.push( { id: option, name: option } );
                }

                elements.push( <FormFieldSelect key={ i } label={ label } value={ props.values[field.column_name] } options={ options } onSelect={ id => { props.setFieldValue( field.column_name, id ); } } /> );
			}
            else if( field.type_name === 'varchar' )
			{
				let multiline = false;

				if ( ( field.max_length >= 100 ) || ( field.max_length < 0 ) )
				{
					multiline = true;
				}

				elements.push( <FormFieldText key={ i } label={ label } value={ props.values[field.column_name] } multiline={ multiline } onChangeText={ text => { props.setFieldValue( field.column_name, text ); } } /> );
            }
            else if( field.type_name === 'bit' )
            {
            	elements.push( <FormFieldCheckbox key={ i } label={ label } value={ props.values[field.column_name] } onChange={ checked => { props.setFieldValue( field.column_name, checked ); } } /> );
			}
            else if( field.type_name === 'datetime' )
			{
				elements.push( <FormFieldDate key={ i } label={ label } value={ props.values[field.column_name] } onSelect={ nextDate => { props.setFieldValue( field.column_name, nextDate ); } } /> );
			}
		}

		return elements;
	};

	const onSubmit = ( values, actions ) =>
	{
		APIService( context.current )
            .addEditObituary(
                values,
                function( data )
				{
					Toast.show( 'Service saved successfully', Toast.LONG, [ 'RCTModalHostViewController', 'UIAlertController' ] );

					if( !route.params )
					{
						onBackButtonPress();
					}
                },
                function( errors )
				{
					Toast.show( 'Failed To save service, please try again.', Toast.LONG, [ 'RCTModalHostViewController', 'UIAlertController' ] );
                }
            );
	};

	const onOKDeleteMessageDialogPress = () =>
	{
		setModalDeleteConfirmVisible( false );

		setTimeout( () =>
		{
			APIService( context.current ).deleteObituary( route.params.id, function( data ){ onBackButtonPress(); } );
		}, 1000 );
	};

	return (
		<SafeAreaView style={ { flex: 1, backgroundColor: BACKGROUND_COLOR } }>
			<FCTopNavigation navigation={ navigation } accessoryLeft={ accessoryLeftProps => <BackButton { ...accessoryLeftProps } /> }/>
			<FCHeader title={ 'Service Detail' }/>
			<Formik enableReinitialize initialValues={ service } onSubmit={ onSubmit } validateOnChange={ false } validateOnBlur={ false }>
				{ props => {
					return (
					<KeyboardAvoidingView style={ { flex: 1 } } behavior={ Platform.OS === 'ios' ? 'padding' : 'height' } keyboardVerticalOffset={ Platform.select( { ios: 50, android: 50 } ) }>
						<ScrollView style={ { flex: 1, backgroundColor: '#ffffff', borderRadius: 5, margin: 10 } }>
							{ renderFormElements( props ) }
						</ScrollView>
						<View style={ { margin: 10, marginTop: 5, marginBottom: 15, flexDirection: 'row' } }>
							{ route.params && route.params.id &&
								<>
									<FCButton label={ 'DELETE' } labelStyle={ { fontSize: 18, textAlign: 'center' } } buttonStyle={ { flex: 1, backgroundColor: ERROR_COLOR } } onPress={ () => onDelete() }/>
									<View style={ { width: 10 } } />
								</>
							}
							<FCButton label={ 'SAVE' } labelStyle={ { fontSize: 18, textAlign: 'center' } } buttonStyle={ { flex: 1, backgroundColor: PRIMARY_COLOR } } onPress={ props.handleSubmit }/>
						</View>
					</KeyboardAvoidingView>
				); } }
			</Formik>

			<DialogOKCancel visible={ modalDeleteConfirmVisible } message={ 'Are you sure you want to delete this service?' } showCancelButton={ 'true' } onCancelPress={ () => onCancelDeleteMessageDialogPress() } onOKPress={ () => onOKDeleteMessageDialogPress() }/>
		</SafeAreaView>
	);
}
