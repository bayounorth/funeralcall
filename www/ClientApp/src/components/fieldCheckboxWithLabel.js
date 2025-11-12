import Checkbox from '@material-ui/core/Checkbox';
import {FormControlLabel} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import {useViewport} from "../viewportService";

const FieldCheckboxWithLabel = props => {
    const isMobile  = useViewport().width < 640;
    const useStyles = makeStyles(theme => ( {
        root: {
            backgroundColor: 'white',
            borderRadius:   4,
            marginLeft:     5,
            paddingRight:   10,
            width:          isMobile ? 250 : '100%',
            marginTop:      4,
            marginBottom:   4,
            color:          '#424242',
            "& .MuiIconButton-label": {
                color: '#424242',
            },
            "& .MuiTypography-body1": {
                fontWeight: '700 !important'
            }
        }
    } ) );

    const classes = useStyles();
    
    return (
        <FormControlLabel 
            control={
                        <Checkbox name={ props.id } 
                                  id={ props.id } 
                                  size={ props.size ? props.size : 'medium' }
                                  error={ props.errors[props.id] && props.touched[props.id] } 
                                  checked={ props.values && props.values[props.id] && props.values[props.id] !== null ? props.values[props.id] : false } 
                                  onChange={ props.onChange } 
                                  disabled={ props.disabled ? props.disabled : null }
                                  style={ props.style ? props.style : { margin: 4 } }/> }
            label={ props.label }
            size={ props.size ? props.size : 'medium' }
            classes={ classes }
        />
    )
}

export default FieldCheckboxWithLabel;