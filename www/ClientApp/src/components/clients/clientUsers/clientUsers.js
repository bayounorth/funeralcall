import React from "react";
import {Paper, Tab, Tabs} from "@material-ui/core";
import ClientUserListing from "./clientUserListing";
import ClientUserAddEdit from "./clientUserAddEdit";

const ClientUsers = props =>
{
    const [value, setValue] = React.useState( 0 );
    const [id, setId]       = React.useState( null );
    const handleChange      = ( event, newValue ) => { setId( null ); setValue( newValue ); };
    
    function tabProps( index )
    {
        return { id: `tab-client-user-${ index }` };
    }
    
    function onEditClientUser( id )
    {
        setId( id );
        setValue( 1 );
    }
    
    function onAddEditComplete()
    {
        setId( null );
        setValue( 0 );
    }
    
    return (
        <Paper square>
            <Tabs value={ value } onChange={ handleChange }>
                <Tab label="Client User Listing" { ...tabProps( 0 ) } />
                { props.clientId && <Tab label="Add / Edit Client User" { ...tabProps( 1 ) } /> }
                { !props.clientId && <Tab label="Edit Client User" disabled { ...tabProps( 1 ) } /> }
            </Tabs>
            { value === 0 && <ClientUserListing onEditClientUser={ onEditClientUser } clientId={ props.clientId } /> }
            { value === 1 && <ClientUserAddEdit id={ id } clientId={ props.clientId } onAddEditComplete={ onAddEditComplete } /> }
        </Paper>
    );
}

export default ClientUsers;