import {useRef, useState, useContext, useEffect} from "react";
import {DataGrid} from "@material-ui/data-grid";
import {Paper} from "@material-ui/core";
import {
    ARE_YOU_SURE_DELETE,
    buildSearchQuery, buildTableSort, DELETE_RECORD, NO,
    PAGE_SIZE, presentDialogFailed, presentDialogSuccess,
    renderTableCheckmark,
    ROWS_PER_PAGE_OPTIONS, SUCCESSFULLY_DELETED, TABLE_HEIGHT_OPTIONS, UNSUCCESSFULLY_DELETED, useAsyncReference, YES
} from "../../constants";
import {DialogContext} from "../../services/dialogService";
import {StateContext} from "../../stateService";
import APIService from "../../apiService";
import ButtonEdit from "../buttonEdit";
import ButtonDelete from "../buttonDelete";

const ClientListing = props => {
    const [tableHeight, setTableHeight] = useState( 950 );
    const [rows, setRows]               = useState( [] );
    const [rowCount, setRowCount]       = useState( 0 );
    const [page, setPage]               = useAsyncReference( 0 );
    const [pageSize, setPageSize]       = useAsyncReference( 0 );
    const [gridApi, setGridApi]         = useAsyncReference( null );
    const context                       = useRef( useContext( StateContext ) );
    const dialogContext                 = useContext( DialogContext );
    const onRenderIsActive              = ( params ) => { return renderTableCheckmark( params.row.is_active ); };
    const handlePageChange              = ( params ) => { onPageChange( params ); refreshClientListing( params, gridApi.current ? gridApi.current.state.filter.items : null, gridApi.current ? gridApi.current.state.sorting.sortModel : null ); };
    const handleFilterModelChange       = ( params ) => { refreshClientListing( params.api.state.pagination, params.filterModel.items, params.api.state.sorting.sortModel, params.api ); };
    const handleSortModelChange         = ( params ) => { refreshClientListing( params.api.state.pagination, params.api.state.filter.items, params.sortModel, params.api ); };
    const onEditClient                  = ( row ) => { props.onEditClient( row.id ); };
    const onDeleteClient                = ( row ) => { dialogContext.presentDialog( true, DELETE_RECORD, ARE_YOU_SURE_DELETE, NO, () => {}, YES, onDeleteClientPositive, { id: row.id }, null ); };
    
    const columns                       = [
                                            { field: "edit", filterable: false, headerName: ' ', width: 60, align: 'center', disableColumnMenu: true, disableClickEventBubbling: true, renderCell: ( params ) => { return <ButtonEdit onClick={ () => onEditClient( params.row ) } /> ; } },
                                            { field: "delete", filterable: false, headerName: ' ', width: 60, align: 'center', disableColumnMenu: true, disableClickEventBubbling: true, renderCell: ( params ) => { return <ButtonDelete onClick={ () => onDeleteClient( params.row ) } /> ; } },
                                            { field: 'id', hide: true, filterable: false, sortable: false },
                                            { field: 'account_number', headerName: 'Account Number', width: 200 },
                                            { field: 'client_name', headerName: 'Client Name', flex: 1 },
                                            { field: 'is_active', headerName: 'Active', headerAlign: 'center', width: 100, align: 'center', renderCell: onRenderIsActive }
                                        ];

    const refreshClientListing = ( params, filter, sort, api ) => {
        
        let query = { page: ( params.page + 1 ), limit: params.pageSize };
        
        setPage( page.current = params.page );
        setPageSize( pageSize.current = params.pageSize );
        
        if( !gridApi.current )
        {
            setGridApi( gridApi.current = api );
        }
        
        if( filter )
        {
            query = { ...query, ...buildSearchQuery( filter ) };
        }
        
        if( sort )
        {
            query = { ...query, ...{ order_by: buildTableSort( sort ) } };
        }
        
        APIService( context.current )
            .getClients
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
    
    const onDeleteClientPositive = ( data ) => {
        
        APIService( context.current ).deleteClient( data.id, function( success )
        {
            if( success )
            {
                presentDialogSuccess( dialogContext, SUCCESSFULLY_DELETED, () => { refreshClientListing( { page: page.current, pageSize: pageSize.current } ); } );
            }
            else
            {
                presentDialogFailed( dialogContext, UNSUCCESSFULLY_DELETED, null );
            }
        } );
    };
    
    useEffect( () =>
	{
	    refreshClientListing( { page: 0, pageSize: PAGE_SIZE }, null, null );
	}, [] )
    
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
        <div style={ { height: tableHeight, width: '100%', padding: 25 } }>
            <Paper style={ { height: '100%', width: '100%' } }>
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
                          disableColumnSelector/>
            </Paper>
        </div>
    );
};

export default ClientListing;