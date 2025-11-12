import {Button} from "@material-ui/core";
import {blueGrey} from "@material-ui/core/colors";

const ButtonNeutral = props => {
    return (
        <Button variant="contained" disabled={ props.disabled } style={ { backgroundColor: blueGrey["300"], color: '#fff', minWidth: 100, marginRight: 10, ...props.style } } onClick={ props.onClick }>{ props.label }</Button>
    )
}

export default ButtonNeutral;