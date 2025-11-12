import DoneOutlinedIcon from "@material-ui/icons/DoneOutlined";
import {useRef, useState} from "react";
import {Link, Typography} from "@material-ui/core";
import MomentUtils from '@date-io/moment';

export const LOADING                = 'loading';
export const USER                   = 'user';
export const PAGE_SIZE              = 15;
export const ROWS_PER_PAGE_OPTIONS  = [ 5, 15, 25, 50 ];
export const TABLE_HEIGHT_OPTIONS   = [ { rows: 5, height: 450 }, { rows: 15, height: 950 }, { rows: 25, height: 1500 }, { rows: 50, height: 2800 } ];
export const PRIMARY_COLOR          = '#1daccc';

export const OK                     = 'OK';
export const YES                    = 'Yes';
export const NO                     = 'No';

export const DELETE_RECORD          = 'Delete record';
export const ARE_YOU_SURE_DELETE    = 'Are you sure you want to delete this record?';

export const OPERATION_SUCCESSFUL   = 'Operation Successful';
export const SUCCESSFULLY_DELETED   = 'Record successfully deleted.';
export const SUCCESSFULLY_ADDED     = 'Record successfully added.';
export const SUCCESSFULLY_UPDATED   = 'Record successfully updated.';

export const OPERATION_FAILED       = 'Operation Failed';
export const UNSUCCESSFULLY_DELETED = 'Unable to delete record.';

export function camelCase( str )
{
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
    }).replace(/\s+/g, '');
}

export function renderTableCheckmark( isChecked )
{
    if( !isChecked ){ return <div />; } return <DoneOutlinedIcon style={ { color: PRIMARY_COLOR } } />;
}

export const onRenderBlankFiller = ( params ) => { return <div/>; };

export const dateFormatter = ( value ) => 
{
    if( value == null ){ return ''; }
    
    return new Date( value ).toLocaleDateString( "en-US" );
};

export const timeFormatter = ( value ) => 
{
    if( value == null ){ return ''; }
    
    return new Date( value ).toLocaleTimeString( "en-US" );
};

export const dateFormatterAlt = ( value ) => 
{
    if( value == null ){ return ''; }
    
    const moment    = new MomentUtils();
    const date      = moment.date( value );
    
    return moment.format( date, "yyyy-MM-DD" );
};

export const getToday = () => 
{
    const moment = new MomentUtils();
    
    return moment.date();
};

export function presentDialogSuccess( dialogContext, message, callback )
{
    dialogContext.presentDialog( true, OPERATION_SUCCESSFUL, message, null, null, OK, callback, null, null );
}

export function presentDialogFailed( dialogContext, message, callback )
{
    dialogContext.presentDialog( true, OPERATION_FAILED, message, null, null, OK, callback, null, null );
}

export function buildSearchQuery( filterModelItems )
{
    let searchQuery = { columns: [], search: [] };
    
    for( let i = 0; i < filterModelItems.length; i++ )
    {
        const item = filterModelItems[i];
        
        if( item.value )
        {
            searchQuery.columns.push( item.columnField );
            searchQuery.search.push( item.value );
        }
    }
    
    return searchQuery;
}

export function buildTableSort( sortModelItems )
{
    let sort = [];
    
    for( let i = 0; i < sortModelItems.length; i++ )
    {
        const item = sortModelItems[i];

        sort.push( item.field + " " + item.sort );
    }
    
    return sort;
}

export function useAsyncReference( value, isProp = false )
{
    const ref               = useRef( value );
    const [, forceRender]   = useState( false );
    
    function updateState( newState )
    {
        if( !Object.is( ref.current, newState ) )
        {
            ref.current = newState;
            
            forceRender( s => !s );
        }
    }
    
    if( isProp )
    {
        ref.current = value;
        
        return ref;
    }

    return [ref, updateState];
}

export function Copyright()
{
    return (
        <Typography variant="body2" align="center">
            { '©' }
            { new Date().getFullYear() }
            { ' ' }
            <Link color="inherit" underline="always" href="https://www.funeralcall.com" target="_blank">Omni Enterprises, Inc</Link>
        </Typography>
    );
}

export const formatPhoneNumber = ( phone_number ) =>
{
    if( ( phone_number === null ) || ( phone_number.length === 0 ) || ( phone_number.length !== 10 ) ){ return ''; }

    return `(${ phone_number.substring( 0, 3 ) }) ${ phone_number.substring( 3, 6 ) }-${ phone_number.substring( 6, 10 ) }`;
};