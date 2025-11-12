import {IconButton} from "@material-ui/core";
import DeleteForeverOutlinedIcon from '@material-ui/icons/DeleteForeverOutlined';
import {red} from "@material-ui/core/colors";

const ButtonDelete = props => {
    return (
        <IconButton onClick={ props.onClick }>
            <DeleteForeverOutlinedIcon style={ { color: red.A700 } }/>
        </IconButton>
    )
}

export default ButtonDelete;