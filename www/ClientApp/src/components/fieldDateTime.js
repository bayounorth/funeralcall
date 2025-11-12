import {DatePicker} from "@material-ui/pickers";
import {IconButton} from "@material-ui/core";
import ClearIcon from "@material-ui/icons/Clear";
import {useEffect, useState} from "react";
import MomentUtils from "@date-io/moment";

const FieldDateText = ( { field, form, ...props } ) =>
{
    const [value, setValue] = useState( null );
    
    const augmentStyle = ( styles ) =>
    {
        return Object.assign
                        (
                            {
                                backgroundColor:    '#fff',
                                borderRadius:       '3px',
                                paddingLeft:        '12px',
                                paddingBottom:      '7px',
                                paddingRight:       '12px'
                            },
                            styles
                        );
    };
    
    useEffect( () => 
    {
        if( field.value )
        {
            const moment = new MomentUtils();
            
            setValue( moment.date( field.value ) );
        }
        else
        {
            onChange( null );
        }
        
    }, [field.value] );

    const handleClear = ( e ) =>
    {
        e.stopPropagation();

        onChange( null );
    };
    
    const onChange = ( date ) =>
    {
        const moment = new MomentUtils();
        
        if( date )
        {
            date = moment.startOfDay( date ).utc().add( date.utcOffset(), 'm' );
        }
        
        form.setFieldValue( field.name, date, false );

        setValue( date );
    };
    
    return (
        <DatePicker name={ props.id } 
                    id={ props.id } 
                    label={ props.label } 
                    size={ props.size ? props.size : 'medium' }
                    error={ props.errors[props.id] && props.touched[props.id] } 
                    helperText={ props.errors[props.id] && props.touched[props.id] ? props.errors[props.id] : null } 
                    value={ value }
                    onChange={ date => onChange( date ) } 
                    style={ props.style ? augmentStyle( props.style ) : { margin: 5, width: '100%' } }
                    format="MM/DD/yyyy"
                    variant="outlined"
                    InputProps={ {
                        endAdornment: (
                            <IconButton style={ { padding: 0 } } onClick={ ( e ) => handleClear( e ) }>
                                <ClearIcon/>
                            </IconButton>
                        )
                    }}/>
    )
}

export default FieldDateText;