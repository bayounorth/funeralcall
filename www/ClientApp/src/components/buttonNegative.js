import {Button} from "@material-ui/core";
import {red} from "@material-ui/core/colors";

const ButtonNegative = props => {
    return (
        <Button variant="contained" disabled={ props.disabled } style={ { backgroundColor: red["500"], color: '#fff', minWidth: 100, marginRight: 10 } } onClick={ props.onClick }>{ props.label }</Button>
    )
}

export default ButtonNegative;