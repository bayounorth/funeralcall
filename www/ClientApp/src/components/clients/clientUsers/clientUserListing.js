import {useRef, useState, useContext, useEffect} from "react";
import {DataGrid} from "@material-ui/data-grid";
import {Paper} from "@material-ui/core";
import {
    ARE_YOU_SURE_DELETE,
    buildSearchQuery, buildTableSort, DELETE_RECORD, formatPhoneNumber, NO,
    onRenderBlankFiller,
    PAGE_SIZE, presentDialogFailed, presentDialogSuccess,
    renderTableCheckmark,
    ROWS_PER_PAGE_OPTIONS, SUCCESSFULLY_DELETED, TABLE_HEIGHT_OPTIONS, UNSUCCESSFULLY_DELETED, useAsyncReference, YES
} from "../../../constants";
import {DialogContext} from "../../../services/dialogService";
import {StateContext} from "../../../stateService";
import APIService from "../../../apiService";
import ButtonEdit from "../../buttonEdit";
import ButtonDelete from "../../buttonDelete";

const ClientUserListing = props => {
    const [tableHeight, setTableHeight] = useState( 950 );
    const [rows, setRows]               = useState( [] );
    const [rowCount, setRowCount]       = useState( 0 );
    const [page, setPage]               = useAsyncReference( 0 );
    const [pageSize, setPageSize]       = useAsyncReference( 0 );
    const [gridApi, setGridApi]         = useAsyncReference( null );
    const context                       = useRef( useContext( StateContext ) );
    const dialogContext                 = useContext( DialogContext );
    const onRenderIsActive              = ( params ) => { return renderTableCheckmark( params.row.is_active ); };
    const onRenderIsNotifications       = ( params ) => { return renderTableCheckmark( params.row.notifications ); };
    const handlePageChange              = ( params ) => { onPageChange( params ); refreshClientUserListing( params, gridApi.current ? gridApi.current.state.filter.items : null, gridApi.current ? gridApi.current.state.sorting.sortModel : null ); };
    const handleFilterModelChange       = ( params ) => { refreshClientUserListing( params.api.state.pagination, params.filterModel.items, params.api.state.sorting.sortModel, params.api ); };
    const handleSortModelChange         = ( params ) => { refreshClientUserListing( params.api.state.pagination, params.api.state.filter.items, params.sortModel, params.api ); };
    const onEditClientUser              = ( row ) => { props.onEditClientUser( row.id ); };
    const onDeleteClientUser            = ( row ) => { dialogContext.presentDialog( true, DELETE_RECORD, ARE_YOU_SURE_DELETE, NO, () => {}, YES, onDeleteClientUserPositive, { id: row.id }, null ); };
    
    const columns                       = [
                                            { field: "edit", headerName: ' ', width: 60, align: 'center', disableColumnMenu: true, disableClickEventBubbling: true, renderCell: ( params ) => { return <ButtonEdit onClick={ () => onEditClientUser( params.row ) } /> ; } },
                                            { field: "delete", headerName: ' ', width: 60, align: 'center', disableColumnMenu: true, disableClickEventBubbling: true, renderCell: ( params ) => { return <ButtonDelete onClick={ () => onDeleteClientUser( params.row ) } /> ; } },
                                            { field: 'id', hide: true, filterable: false, sortable: false },
                                            { field: 'account_number', headerName: 'Account #', width: 150, hide: props.clientId },
                                            { field: 'client_name', headerName: 'Client', width: 300, hide: props.clientId },
                                            { field: 'username', headerName: 'Username', width: 150 },
                                            { field: 'first_name', headerName: 'First Name', width: 250 },
                                            { field: 'last_name', headerName: 'Last name', width: 250 },
                                            { field: 'email_address', headerName: 'Email Address', width: 250 },
                                            { field: 'office_number', headerName: 'Office Number', width: 200, valueFormatter: ( { value } ) => { return formatPhoneNumber( value ); } },
                                            { field: 'cell_phone_number', headerName: 'Cell Phone Number', width: 250, valueFormatter: ( { value } ) => { return formatPhoneNumber( value ); } },
                                            { field: 'is_active', headerName: 'Active', headerAlign: 'center', width: 150, align: 'center', renderCell: onRenderIsActive },
                                            { field: 'app_token', headerName: 'Notification Token', width: 250 },
                                            { field: 'notifications', headerName: 'Notifications', headerAlign: 'center', width: 150, align: 'center', renderCell: onRenderIsNotifications },
                                            { field: 'standard_sound', headerName: 'Standard Sound', width: 200 },
                                            { field: 'firstcall_sound', headerName: 'FirstCall Sound', width: 200 }
                                        ];

    const refreshClientUserListing = ( params, filter, sort, api ) => {
        
        let query = { page: ( params.page + 1 ), limit: params.pageSize, columns: [ 'client_id' ], search: [ props.clientId ] };
        
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
            .getClientUsers
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
    
    const onDeleteClientUserPositive = ( data ) => {
        
        APIService( context.current ).deleteClientUser( data.id, function( success )
        {
            if( success )
            {
                presentDialogSuccess( dialogContext, SUCCESSFULLY_DELETED, () => { refreshClientUserListing( { page: page.current, pageSize: pageSize.current } ); } );
            }
            else
            {
                presentDialogFailed( dialogContext, UNSUCCESSFULLY_DELETED, null );
            }
        } );
    };
    
    useEffect( () =>
	{
        refreshClientUserListing( { page: 0, pageSize: PAGE_SIZE }, null, null, null );
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

export default ClientUserListing;