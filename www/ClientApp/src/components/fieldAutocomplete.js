import React, {useContext, useEffect, useRef, useState} from 'react';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import APIService from "../apiService";
import {StateContext} from "../stateService";

const FieldAutocomplete = ( { field, form, ...props } ) =>
{
    const context               = useRef( useContext( StateContext ) );
    const [options, setOptions] = useState( [] );
    const [value, setValue]     = useState( null );
    const currentError          = form.errors[field.name];

    useEffect( () => 
    {
        let active = true;

        ( async () => {
            
            let results = null;
            
            if( props.url )
            {
                const response = await APIService( context.current ).asyncPost( props.url, props.url_data );
                
                if( ( !response.data ) && ( !response.data.data )  && ( !response.data.data.results ) )
                {
                    return undefined;
                }
                
                results = response.data.data.results;
            }
            else
            {
                results = props.options;
            }
            
            if( field.value )
            {
                for( let i = 0; i < results.length; i++ )
                {
                    const result = results[i];
                    
                    if( field.value === result[props.option_key] )
                    {
                        setValue( result );
                        break;
                    }
                }
            }
            
            if( active )
            {
                setOptions( results );
            }
        } )();

        return () => { active = false; };
        
    }, [field.value] );
    
    const onChange = ( event, newValue ) =>
    {
        if( newValue === null )
        {
            form.setFieldValue( field.name, null, false );
        }
        else
        {
            form.setFieldValue( field.name, newValue[props.option_key], false );
        }
        
        setValue( newValue );
    };

    return (
        <Autocomplete
            name={ field.name }
            id={ field.id }
            size={ props.size ? props.size : 'medium' }
            style={ props.style ? props.style : { margin: 5, width: 250, display: 'inline-flex' } }
            value={ value }
            onChange={ onChange } 
            getOptionSelected={ ( option, value ) => option[props.option_key] === value[props.option_key] }
            getOptionLabel={ ( option ) => option[props.option_name] }
            options={ options }
            renderInput={ ( params ) => (
                <TextField
                    { ...params }
                    label={ props.label }
                    variant="outlined"
                    error={ Boolean( currentError ) }
                    onError={ error => { if( error !== currentError ){ form.setFieldError( field.name, error ); } } }
                    helperText={ currentError }
                />
            )}
        />
    );
}

export default FieldAutocomplete;