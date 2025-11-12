import {useContext, useEffect, useRef, useState} from "react";
import APIService from "../../apiService";
import {StateContext} from "../../stateService";
import {DialogContext} from "../../services/dialogService";
import {Formik, Form, Field} from "formik";
import ButtonNeutral from "../buttonNeutral";
import ButtonPositive from "../buttonPositive";
import {Paper} from "@material-ui/core";
import FieldText from "../fieldText";
import FieldCheckboxWithLabel from "../fieldCheckboxWithLabel";
import {
    dateFormatterAlt, getToday,
    OK,
    OPERATION_FAILED,
    OPERATION_SUCCESSFUL,
    SUCCESSFULLY_ADDED,
    SUCCESSFULLY_UPDATED
} from "../../constants";
import FieldTextArea from "../fieldTextArea";
import FieldAutocomplete from "../fieldAutocomplete";
import {useViewport} from "../../viewportService";
import FieldDateText from "../fieldDateTime";

const ObituaryAddEdit = props =>
{
    const isMobile	                = useViewport().width < 640;
    const context                   = useRef( useContext( StateContext ) );
    const dialogContext             = useContext( DialogContext );
    const [fields, setFields]       = useState( [] );
    const [obituary, setObituary]   = useState( {} );
    
    useEffect( () =>
	{
	    APIService( context.current ).getObituaryColumns( function( data ) {
	        setFields( data );
	        
	        if( !props.id ){ return; }
	        
	        APIService( context.current ).getObituary( props.id, function( data ) { setObituary( data ); window.scrollTo( 0, 0 ) } );
	    } );
		
	}, [ props.id ] )
    
    const onCancel = () => { props.onAddEditComplete(); };
    
    const onSubmit = ( values, actions ) => 
    {
        const errors = {};
        
        // Check for any required fields prior to submission ...
        for( let i = 0; i < fields.length; i++ )
        {
            const field = fields[i];
            
            if( field.is_identity === true ){ continue; }
            if( field.is_editable !== true ){ continue; }
            if( field.is_required !== true ){ continue; }
            
            if( !values.hasOwnProperty( field.column_name ) )
            {
                errors[field.column_name] = 'Required';
                
                actions.setFieldTouched( field.column_name, true );
            }
        }
        
        if( Object.keys( errors ).length > 0 )
        {
            actions.setSubmitting( false );
            actions.setErrors( errors );
            
            dialogContext.presentDialog( true, OPERATION_FAILED, 'Please check your submission for errors.', null, null, OK, null, null, null );
            
            return;
        }
        
        APIService( context.current )
            .addEditObituary(
                values, 
                function( data ){
                    actions.setSubmitting( false );
                    
                    let message = SUCCESSFULLY_ADDED;
                    
                    if( props.id )
                    {
                        message = SUCCESSFULLY_UPDATED;
                    }
                    
                    dialogContext.presentDialog( true, OPERATION_SUCCESSFUL, message, null, null, OK, () => { props.onAddEditComplete(); }, null, null );
                },
                function( errors ){
                    
                    actions.setSubmitting( false );
                    actions.setErrors( errors );
                }
            );
	};
    
    const renderFormElements = ( values, errors, touched, handleChange ) => {

        let elements = [];
        
        for( let i = 0; i < fields.length; i++ )
        {
            const   field   = fields[i];
            let     label   = field.column_name;
            const   width   = isMobile ? 250 : '100%';
            
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
                
                if( values.hasOwnProperty( field_name ) === true )
                {
                    if( values[field_name] !== null )
                    {
                        if( field_value.toLowerCase() === values[field_name].toLowerCase() )
                        {
                            field_hidden = false;
                        }
                    }
                }
                
                if( field_hidden === true )
                {
                    continue;
                }
            }
            
            if( field.column_name === 'client_id' )
            {
                elements.push( <div key={ i }><Field component={ FieldAutocomplete } name={ field.column_name } label={ label } url="Client/query" url_data={ { limit: 9999 } } option_key="id" option_name="client_name" style={ { margin: 5, width: width, display: 'inline-flex' } } /></div> );
            }
            else if( ( field.options ) && ( field.options.length > 0 ) )
            {
                const   field_options   = field.options.split( ',' );
                let     options         = [];

                for( let j = 0; j < field_options.length; j++ )
                {
                    const option = field_options[j].trim();
                    
                    options.push( { id: option, name: option } );
                }
                
                elements.push( <div key={ i }><Field component={ FieldAutocomplete } name={ field.column_name } label={ label } options={ options } option_key="id" option_name="name" style={ { margin: 5, width: width, display: 'inline-flex' } } /></div> );
            }
            else if( field.type_name === 'varchar' )
            {
                if( ( field.max_length >= 200 ) || ( field.max_length < 0 ) )
                {
                    elements.push( <div key={ i }><FieldTextArea id={ field.column_name } label={ label } values={ values } errors={ errors } touched={ touched } onChange={ handleChange } style={ { margin: 5, width: width } } /><br /></div> );
                }
                else
                {
                    elements.push( <div key={ i }><FieldText id={ field.column_name } label={ label } values={ values } errors={ errors } touched={ touched } onChange={ handleChange } style={ { margin: 5, width: width } } /><br /></div> );
                }
            }
            else if( field.type_name === 'bit' )
            {
                if( field.default_value )
                {
                    if( field.default_value === '1' )
                    {
                        values[field.column_name] = true;
                    }
                    else
                    {
                        values[field.column_name] = false;
                    }
                }
                
                elements.push( <div key={ i }><FieldCheckboxWithLabel id={ field.column_name } label={ label } values={ values } errors={ errors } touched={ touched } onChange={ handleChange } /><br /></div> );
            }
            else if( field.type_name === 'datetime' )
            {
                elements.push( <div key={ i }><Field component={ FieldDateText } name={ field.column_name } label={ label } values={ values } errors={ errors } touched={ touched } onChange={ handleChange } style={ { margin: 5, width: width } } /><br /></div> );
            }
        }
        
        return elements;
    }
    
    return (
        <div style={ { padding: isMobile ? 10 : 25 } }>
            <Paper style={ { padding: isMobile ? 5 : 25, textAlign: 'center' } }>
                <Formik enableReinitialize initialValues={ obituary } onSubmit={ onSubmit } validateOnChange={ false } validateOnBlur={ false }>
                    { ( { values, submitForm, isSubmitting, touched, errors, handleChange } ) => (
                    <Form>
                        <ButtonNeutral label="Cancel" disabled={ isSubmitting } onClick={ onCancel } />
                        <ButtonPositive label="Save" disabled={ isSubmitting } onClick={ submitForm } style={ { marginLeft: 0 } } />
                        <br />
                        <br />
                        { renderFormElements( values, errors, touched, handleChange ) }
                        <br />
                        <br />
                        <ButtonNeutral label="Cancel" disabled={ isSubmitting } onClick={ onCancel } />
                        <ButtonPositive label="Save" disabled={ isSubmitting } onClick={ submitForm } style={ { marginLeft: 0 } } />
                        <br />
                        <br />
                    </Form>
                    ) }
                </Formik>
            </Paper>
        </div>
    );
}

export default ObituaryAddEdit;