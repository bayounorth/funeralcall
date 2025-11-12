import { TextField } from "@material-ui/core";

const FieldTextArea = props => {
    return (
        <TextField name={ props.id } 
                   id={ props.id } 
                   label={ props.label } 
                   size={ props.size ? props.size : 'medium' }
                   type={ props.type ? props.type : 'text' } 
                   error={ props.errors[props.id] && props.touched[props.id] } 
                   helperText={ props.errors[props.id] && props.touched[props.id] ? props.errors[props.id] : null } 
                   value={ props.values && props.values[props.id] && props.values[props.id] !== null ? props.values[props.id] : '' }
                   onChange={ props.onChange } 
                   style={ props.style ? props.style : { margin: 5, width: 250 } }
                   multiline
                   variant="outlined"
                   rows={ props.rows ? props.rows : 5 }/>
    )
}

export default FieldTextArea;