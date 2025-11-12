import {IconButton} from "@material-ui/core";
import EditOutlinedIcon from '@material-ui/icons/EditOutlined';
import {green} from "@material-ui/core/colors";

const ButtonEdit = props => {
    return (
        <IconButton onClick={ props.onClick }>
            <EditOutlinedIcon style={ { color: green.A700 } }/>
        </IconButton>
    )
}

export default ButtonEdit;