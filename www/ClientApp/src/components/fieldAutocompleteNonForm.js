import React from 'react';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import {makeStyles} from "@material-ui/core/styles";

const FieldAutocompleteNonForm = ( props ) =>
{
    const useStyles = makeStyles(theme => ( {
        input: {
            paddingTop: '2px',
            paddingBottom: '2px'
        },
        root: {
            "& .MuiFormControl-fullWidth": {
                marginTop: '20px'
            },
            "& .MuiFormControl-fullWidth .MuiFormLabel-root": {
                color: '#424242',
                fontWeight: 700,
                transform: 'translate(14px, 16px)',
                backgroundColor: 'rgba(0,0,0,0)'
            },
            "& .MuiFormControl-fullWidth .MuiInputLabel-shrink": {
                color: '#fff',
                fontWeight: 700,
                transform: 'translate(14px, -20px)',
                backgroundColor: 'rgba(0,0,0,0)'
            },
            "& .MuiFormControl-fullWidth .MuiInputBase-input": {
                paddingTop: '14px !important'
            }
        }
    } ) );
    
    const onChange = ( event, newValue ) =>
    {
        if( props.onChange )
        {
            props.onChange( props.id, newValue );
        }
    };
    
    const classes = useStyles();

    return (
        <Autocomplete
            name={ props.name }
            id={ props.id }
            size={ "small" }
            style={ props.style }
            value={ props.value }
            onChange={ onChange } 
            getOptionSelected={ ( option, value ) => option[props.option_key] === value[props.option_key] }
            getOptionLabel={ ( option ) => option[props.option_name] }
            options={ props.options }
            classes={ classes }
            renderInput={ ( params ) => (
                <TextField
                    { ...params }
                    label={ props.label } 
                    variant="outlined"/>
            )}
        />
    );
}

export default FieldAutocompleteNonForm;