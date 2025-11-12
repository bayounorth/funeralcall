import React from "react";
import {Paper, Tab, Tabs} from "@material-ui/core";
import UserListing from "./userListing";
import UserAddEdit from "./userAddEdit";

export default function Users()
{
    const [value, setValue] = React.useState( 0 );
    const [id, setId]       = React.useState( null );
    const handleChange      = ( event, newValue ) => { setId( null ); setValue( newValue ); };

    function tabProps( index )
    {
        return { id: `tab-${ index }` };
    }
    
    function onEditUser( recordID )
    {
        setId( recordID );
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
                <Tab label="User Listing" { ...tabProps( 0 ) } />
                <Tab label="Add / Edit User" { ...tabProps( 1 ) } />
            </Tabs>
            { value === 0 && <UserListing onEditUser={ onEditUser } /> }
            { value === 1 && <UserAddEdit id={ id } onAddEditComplete={ onAddEditComplete } /> }
        </Paper>
    );
}