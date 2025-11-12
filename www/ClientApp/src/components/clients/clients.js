import React from "react";
import {Paper, Tab, Tabs} from "@material-ui/core";
import ClientListing from "./clientListing";
import ClientAddEdit from "./clientAddEdit";

export default function Clients()
{
    const [value, setValue] = React.useState( 0 );
    const [id, setId]       = React.useState( null );
    const handleChange      = ( event, newValue ) => { setId( null ); setValue( newValue ); };
    
    function tabProps( index )
    {
        return { id: `tab-${ index }` };
    }
    
    function onEditClient( id )
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
                <Tab label="Client Listing" { ...tabProps( 0 ) } />
                <Tab label="Add / Edit Client" { ...tabProps( 1 ) } />
            </Tabs>
            { value === 0 && <ClientListing onEditClient={ onEditClient } /> }
            { value === 1 && <ClientAddEdit id={ id } onAddEditComplete={ onAddEditComplete } /> }
        </Paper>
    );
}