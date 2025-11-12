import React from "react";
import {Paper, Tab, Tabs} from "@material-ui/core";
import ObituaryListing from "./obituaryListing";
import ObituaryAddEdit from "./obituaryAddEdit";
import ObituaryGridView from "./obituaryGridView";

export default function Obituaries()
{
    const [value, setValue] = React.useState( 0 );
    const [id, setId]       = React.useState( null );
    const handleChange      = ( event, newValue ) => { setId( null ); setValue( newValue ); };

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

    return (
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
    );
}