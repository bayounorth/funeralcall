import React, {useContext, useEffect, useRef} from "react";
import {makeStyles} from '@material-ui/core/styles';
import {Box, CssBaseline, Paper, Tab, Tabs} from "@material-ui/core";
import {Copyright} from "../constants";
import ObituaryListing from "../components/obituaries/obituaryListing";
import {StateContext} from "../stateService";
import {withRouter} from "react-router-dom";
import ButtonNeutral from "../components/buttonNeutral";
import ObituaryGridView from "../components/obituaries/obituaryGridView";
import ObituaryAddEdit from "../components/obituaries/obituaryAddEdit";

const Client = props =>
{
    const useStyles = makeStyles( ( theme ) => ( {
		root: {
			display: 'flex',
		},
		content: {
			flexGrow:	1,
			padding:	theme.spacing( 2 ),
            textAlign:  'center'
		},
        logoutButton: {
		    textAlign:      'center',
            marginBottom:   theme.spacing( 2 )
        }
	} ) );

    const context           = useRef( useContext( StateContext ) );
    const [value, setValue] = React.useState( 0 );
    const [id, setId]       = React.useState( null );
    const handleChange      = ( event, newValue ) => { setId( null ); setValue( newValue ); };
    const classes           = useStyles();
    
    useEffect( () =>
	{
	    if( ( context.current.token === null ) || ( context.current.token.length === 0) )
        {
            props.history.push( "/" );
        }
	}, [ context ] )
    
    function tabProps( index )
    {
        return { id: `tab-${ index }` };
    }
    
    function onEditObituary( recordID )
    {
        setId( recordID );
        setValue( 2 );
    }
    
    function onAddEditComplete()
    {
        setId( null );
        setValue( 1 );
    }

    const onLogout = () =>
    {
        context.current.update( 'token', null );
        
        props.history.push( "/" )
    };
    
    return (
		<div className={ classes.root }>
			<CssBaseline/>
			<main className={ classes.content }>
				<Box sm={ 4 } md={ 7 }>
					<img src={ `${process.env.PUBLIC_URL}/images/funeral-call-logo.png` } height={ 150 } alt="" />
				</Box>
                <Box className={ classes.logoutButton }><ButtonNeutral label="Logout" onClick={ onLogout } /></Box>
                <Paper square>
                    <Tabs value={ value } onChange={ handleChange }>
                        <Tab label="Obituary Grid View" { ...tabProps( 0 ) } />
                        <Tab label="Obituary List View" { ...tabProps( 1 ) } />
                        <Tab label="Add / Edit Obituary" { ...tabProps( 2 ) } />
                    </Tabs>
                    { value === 0 && <ObituaryGridView /> }
                    { value === 1 && <ObituaryListing onEditObituary={ onEditObituary } /> }
                    { value === 2 && <ObituaryAddEdit id={ id } onAddEditComplete={ onAddEditComplete } /> }
                </Paper>
                <Box mt={ 8 }>
                    <Copyright/>
                </Box>
			</main>
		</div>
	);
}

export default withRouter( Client );