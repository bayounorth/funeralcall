import {useContext, useEffect, useRef, useState} from "react";
import {Paper} from "@material-ui/core";
import {DataGrid} from "@material-ui/data-grid";
import {StateContext} from "../../stateService";
import APIService from "../../apiService";
import {
    ARE_YOU_SURE_DELETE, buildSearchQuery, buildTableSort,
    DELETE_RECORD,
    NO,
    onRenderBlankFiller,
    PAGE_SIZE,
    presentDialogFailed,
    presentDialogSuccess,
    renderTableCheckmark, ROWS_PER_PAGE_OPTIONS,
    SUCCESSFULLY_DELETED, TABLE_HEIGHT_OPTIONS,
    UNSUCCESSFULLY_DELETED, useAsyncReference,
    YES
} from "../../constants";
import ButtonDelete from "../buttonDelete";
import ButtonEdit from "../buttonEdit";
import {DialogContext} from "../../services/dialogService";

const UserListing = props =>
{
    const [tableHeight, setTableHeight] = useState( 950 );
    const [rows, setRows]               = useState( [] );
    const [rowCount, setRowCount]       = useState( 0 );
    const [page, setPage]               = useAsyncReference( 0 );
    const [pageSize, setPageSize]       = useAsyncReference( 0 );
    const [gridApi, setGridApi]         = useAsyncReference( null );
    const context                       = useRef( useContext( StateContext ) );
    const dialogContext                 = useContext( DialogContext );
    const onRenderIsActive              = ( params ) => { return renderTableCheckmark( params.row.is_active ); };
    const onRenderIsAdmin               = ( params ) => { return renderTableCheckmark( params.row.is_admin ); };
    const onRenderIsSupervisor          = ( params ) => { return renderTableCheckmark( params.row.is_supervisor ); };
    const onRenderIsOperator            = ( params ) => { return renderTableCheckmark( params.row.is_operator ); };
    const handlePageChange              = ( params ) => { onPageChange( params ); refreshUserListing( params, gridApi.current ? gridApi.current.state.filter.items : null, gridApi.current ? gridApi.current.state.sorting.sortModel : null ); };
    const handleFilterModelChange       = ( params ) => { refreshUserListing( params.api.state.pagination, params.filterModel.items, params.api.state.sorting.sortModel, params.api ); };
    const handleSortModelChange         = ( params ) => { refreshUserListing( params.api.state.pagination, params.api.state.filter.items, params.sortModel, params.api ); };
    const onEditUser                    = ( row ) => { props.onEditUser( row.id ); };
    const onDeleteUser                  = ( row ) => { dialogContext.presentDialog( true, DELETE_RECORD, ARE_YOU_SURE_DELETE, NO, () => {}, YES, onDeleteUserPositive, { id: row.id }, null ); };
    const columns                       = [
                                            { field: "edit", filterable: false, headerName: ' ', width: 60, align: 'center', disableColumnMenu: true, disableClickEventBubbling: true, renderCell: ( params ) => { return <ButtonEdit onClick={ () => onEditUser( params.row ) } /> ; } },
                                            { field: "delete", filterable: false, headerName: ' ', width: 60, align: 'center', disableColumnMenu: true, disableClickEventBubbling: true, renderCell: ( params ) => { return <ButtonDelete onClick={ () => onDeleteUser( params.row ) } /> ; } },
                                            { field: 'id', filterable: false, hide: true },
                                            { field: 'username', headerName: 'Username', width: 200 },
                                            { field: 'first_name', headerName: 'First Name', width: 200 },
                                            { field: 'last_name', headerName: 'Last Name', width: 200 }, 
                                            { field: 'is_active', headerName: 'Active', headerAlign: 'center', width: 150, align: 'center', renderCell: onRenderIsActive }, 
                                            { field: 'is_admin', headerName: 'Admin', headerAlign: 'center', width: 150, align: 'center', renderCell: onRenderIsAdmin },
                                            { field: 'is_supervisor', headerName: 'Supervisor', headerAlign: 'center', width: 150, align: 'center', renderCell: onRenderIsSupervisor },
                                            { field: 'is_operator', headerName: 'Operator', headerAlign: 'center', width: 150, align: 'center', renderCell: onRenderIsOperator },
                                            { field: '__BLANK__', filterable: false, headerName: ' ', flex: 1, renderCell: onRenderBlankFiller }
                                        ];

    const refreshUserListing = ( params, filter, sort, api ) =>
    {
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
            .getUsers
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
                    } );
    };
    
    useEffect( () =>
	{
        refreshUserListing( { page: 0, pageSize: PAGE_SIZE }, null, null );
	}, [] )
    
    const onDeleteUserPositive = ( data ) => {
        
        APIService( context.current ).deleteUser( data.id, function( success )
        {
            if( success )
            {
                presentDialogSuccess( dialogContext, SUCCESSFULLY_DELETED, () => { refreshUserListing( { page: page.current, pageSize: pageSize.current } ); } );
            }
            else
            {
                presentDialogFailed( dialogContext, UNSUCCESSFULLY_DELETED, null );
            }
        } );
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
}

export default UserListing;