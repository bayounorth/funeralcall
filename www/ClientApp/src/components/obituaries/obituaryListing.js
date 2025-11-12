import {Box, Grid, Paper, TextField} from "@material-ui/core";
import {DataGrid} from "@material-ui/data-grid";
import {
    ARE_YOU_SURE_DELETE,
    buildSearchQuery,
    buildTableSort,
    dateFormatter,
    DELETE_RECORD,
    NO,
    PAGE_SIZE,
    presentDialogFailed,
    presentDialogSuccess,
    renderTableCheckmark,
    ROWS_PER_PAGE_OPTIONS,
    SUCCESSFULLY_DELETED, TABLE_HEIGHT_OPTIONS,
    timeFormatter,
    UNSUCCESSFULLY_DELETED,
    useAsyncReference,
    YES
} from "../../constants";
import {useContext, useEffect, useRef, useState} from "react";
import {StateContext} from "../../stateService";
import {DialogContext} from "../../services/dialogService";
import APIService from "../../apiService";
import ButtonEdit from "../buttonEdit";
import ButtonDelete from "../buttonDelete";
import ButtonPositive from "../buttonPositive";
import ButtonNeutral from "../buttonNeutral";
import {makeStyles} from "@material-ui/core/styles";

const ObituaryListing = props =>
{
    const [tableHeight, setTableHeight]         = useState( 950 );
    const [rows, setRows]                       = useState( [] );
    const [columns, setColumns]                 = useState( [] );
    const [rowCount, setRowCount]               = useState( 0 );
    const [searchFieldKey, setSearchFieldKey]   = useState( 0 );
    const [fields, setFields]                   = useAsyncReference( [] );
    const [searchText, setSearchText]           = useAsyncReference( '' );
    const [page, setPage]                       = useAsyncReference( 0 );
    const [pageSize, setPageSize]               = useAsyncReference( 0 );
    const [gridApi, setGridApi]                 = useAsyncReference( null );
    const context                               = useRef( useContext( StateContext ) );
    const dialogContext                         = useContext( DialogContext );
    const handlePageChange                      = ( params ) => { onPageChange( params ); refreshObituaryListing( params, gridApi.current ? gridApi.current.state.filter.items : null, gridApi.current ? gridApi.current.state.sorting.sortModel : null ); };
    const handleFilterModelChange               = ( params ) => { refreshObituaryListing( params.api.state.pagination, params.filterModel.items, params.api.state.sorting.sortModel, params.api ); };
    const handleSortModelChange                 = ( params ) => { refreshObituaryListing( params.api.state.pagination, params.api.state.filter.items, params.sortModel, params.api ); };
    const onEditObituary                        = ( row ) => { props.onEditObituary( row.id ); };
    const onDeleteObituary                      = ( row ) => { dialogContext.presentDialog( true, DELETE_RECORD, ARE_YOU_SURE_DELETE, NO, () => {}, YES, onDeleteObituaryPositive, { id: row.id }, null ); };
    
    const useStyles = makeStyles( {
        root: {
            "& .MuiOutlinedInput-inputMarginDense": {
                    paddingTop: '8px',
                    paddingBottom: '9px'
                }
            }
    } );
    
    useEffect( () =>
	{
	    const listener = event => 
                            {
                                if( event.code === "Enter" || event.code === "NumpadEnter" )
                                {
                                    event.preventDefault();
                    
                                    event.target.blur();
                    
                                    onSearch();
                                }
                            };
	    
		document.addEventListener( "keydown", listener );
		
        getObituaryColumns();
        
        return () => { document.removeEventListener( "keydown", listener ); };
        
	}, [] )
    
    const getObituaryColumns = () => {
        
        APIService( context.current ).getObituaryColumns
                                        (
                                            function( data )
                                            {
                                                let cols = [
                                                            { field: "edit", filterable: false, headerName: ' ', width: 60, align: 'center', disableColumnMenu: true, disableClickEventBubbling: true, renderCell: ( params ) => { if( !gridApi.current ){ setGridApi( gridApi.current = params.api ); } return <ButtonEdit onClick={ () => onEditObituary( params.row ) } /> ; } }, 
                                                            { field: "delete", filterable: false, headerName: ' ', width: 60, align: 'center', disableColumnMenu: true, disableClickEventBubbling: true, renderCell: ( params ) => { return <ButtonDelete onClick={ () => onDeleteObituary( params.row ) } /> ; } }
                                                        ];
                                                
                                                for( let i = 0; i < data.length; i++ )
                                                {
                                                    let columnDefinition    = data[i];
                                                    let column              = { field: columnDefinition.column_name, headerName: columnDefinition.column_name, width: columnDefinition.column_width, hide: columnDefinition.is_identity };
                                                    
                                                    if( columnDefinition.is_visible !== true ){ continue; }
                                                    
                                                    if( ( columnDefinition.column_description ) && ( columnDefinition.column_description.length > 0 ) ){ column["headerName"] = columnDefinition.column_description; }
                                                    
                                                    if( columnDefinition.type_name === 'datetime' )
                                                    {
                                                        if( column["headerName"].toLowerCase().includes( 'stamp' ) )
                                                        {
                                                            column["valueFormatter"] = ( { value } ) => { return dateFormatter( value ) + ' ' + timeFormatter( value ); }
                                                        }
                                                        else
                                                        {
                                                            column["valueFormatter"] = ( { value } ) => { return dateFormatter( value ); }
                                                        }
                                                    }

                                                    if( columnDefinition.type_name === 'bit' )
                                                    {
                                                        column["headerAlign"]       = 'center';
                                                        column["align"]             = 'center';
                                                        column["renderCell"]        = ( params ) => { return renderTableCheckmark( params.row[columnDefinition.column_name] ); }
                                                        column["type"]              = 'boolean';
                                                    }

                                                    cols.push( column );
                                                }
                                                
                                                setColumns( cols );
                                                setFields( fields.current = data );

                                                refreshObituaryListing( { page: 0, pageSize: PAGE_SIZE }, null, null );
                                            }
                                        );
    }
    
    const refreshObituaryListing = ( params, filter, sort, api ) => {
        
        let query = { page: ( params.page + 1 ), limit: params.pageSize };
        
        setPage( page.current = params.page );
        setPageSize( pageSize.current = params.pageSize );
        
        if( !gridApi.current )
        {
            setGridApi( gridApi.current = api );
        }
        
        if( searchText.current )
        {
            query = { ...query, ...{ qualifier: 'OR' }, ...buildSearchQuery( buildSearchFilters() ) };
        }
        else
        {
            if( filter )
            {
                query = { ...query, ...buildSearchQuery( filter ) };
            }
        }
        
        if( sort )
        {
            query = { ...query, ...{ order_by: buildTableSort( sort ) } };
        }
        
        APIService( context.current )
            .getObituaries
                (
                    query, 
                    function( data )
                    {
                        if( filter && api )
                        {
                            api.state.pagination.page = ( data.currentPage - 1 );
                        }
                        
                        setRowCount( data.rowCount );
                        setRows( data.results );
                    }
                );
    };
    
    const onDeleteObituaryPositive = ( data ) => {
        
        APIService( context.current ).deleteObituary( data.id, function( success )
        {
            if( success )
            {
                presentDialogSuccess( dialogContext, SUCCESSFULLY_DELETED, () => { refreshObituaryListing( { page: page.current, pageSize: pageSize.current } ); } );
            }
            else
            {
                presentDialogFailed( dialogContext, UNSUCCESSFULLY_DELETED, null );
            }
        } );
    };
    
    const buildSearchFilters = () => {
        let filters = [];

        for( let i = 0; i < fields.current.length; i++ )
        {
            const field     = fields.current[i];
            const filter    = { columnField: field.column_name, operatorValue: "contains", value: searchText.current };
            
            if( field.type_name !== 'varchar' ){ continue; }

            filters.push( filter );
        }
        
        return filters;
    };
    
    const onSearch = () => {
        
        if( ( !searchText.current ) || ( searchText.current.length === 0 ) ){ return; }
        
        refreshObituaryListing( gridApi.current.state.pagination, null, gridApi.current.state.sorting.sortModel );
    };
    
    const onSearchReset = () => {
        setSearchText( searchText.current = '' );
        
        let key = searchFieldKey + 1;
        
        console.log( key );

        setSearchFieldKey( key );
        
        refreshObituaryListing( gridApi.current.state.pagination, null, gridApi.current.state.sorting.sortModel );
    };
    
    const onPageChange = ( params ) =>
    {
        for( let i = 0; i < TABLE_HEIGHT_OPTIONS.length; i++ )
        {
            const height_option = TABLE_HEIGHT_OPTIONS[i];
            
            if( height_option.rows === params.pageSize )
            {
                setTableHeight( height_option.height );
                break;
            }
        }
    };
    
    return (
        <Box style={ { height: ( tableHeight + 100 ), width: '100%', padding: 25 } }>
            <Grid container spacing={ 2 }>
                <Grid key={ searchFieldKey } item sm={ 10 }>
                    <TextField classes={ useStyles() } size={ 'small' } type={ 'text' } defaultValue={ searchText.current } onBlur={ e => setSearchText( searchText.current = e.target.value ) } variant="outlined" style={ { width: '100%' } }/>
                </Grid>
                <Grid item sm={ 2 } style={ { justifyContent: 'center', alignItems: 'center', textAlign: 'center' } }>
                    <ButtonNeutral label="Reset" onClick={ onSearchReset } />
                    <ButtonPositive label="Search" onClick={ onSearch } />
                </Grid>
                <Grid item sm={ 12 } />
            </Grid>
            <Paper style={ { height: tableHeight, width: '100%' } }>
                <DataGrid rows={ rows }
                          columns={ columns }
                          getRowId={ ( row ) => row.id }
                          pagination
                          pageSize={ PAGE_SIZE }
                          rowCount={ rowCount }
                          rowsPerPageOptions={ ROWS_PER_PAGE_OPTIONS }
                          paginationMode="server"
                          onPageChange={ handlePageChange }
                          onPageSizeChange={ handlePageChange }
                          filterMode="server"
                          onFilterModelChange={ handleFilterModelChange }
                          sortingMode="server"
                          onSortModelChange={ handleSortModelChange }
                          disableSelectionOnClick
                          disableColumnSelector
                          componentsProps={ 
                              {
                                  pagination: 
                                      {
                                          labelRowsPerPage: 'records per page',
                                          labelDisplayedRows: ( { from, to, count } ) => `records ${from}-${to} of total ${count} records`
                                      }
                              } }/>
            </Paper>
        </Box>
    );
}

export default ObituaryListing;