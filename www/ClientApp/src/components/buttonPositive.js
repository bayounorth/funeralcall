import {Button} from "@material-ui/core";
import {PRIMARY_COLOR} from "../constants";

const ButtonPositive = props => {
    return (
        <Button variant="contained" disabled={ props.disabled } style={ { backgroundColor: PRIMARY_COLOR, color: '#fff', minWidth: 100, marginRight: 10, ...props.style } } autoFocus onClick={ props.onClick }>{ props.label }</Button>
    )
}

export default ButtonPositive;