import {
    Grid,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer, TableFooter,
    TableHead, TablePagination,
    TableRow
} from "@material-ui/core";
import {Formik, Form, Field} from "formik";
import ButtonNeutral from "../buttonNeutral";
import ButtonPositive from "../buttonPositive";
import {useViewport} from "../../viewportService";
import {useContext, useEffect, useRef, useState} from "react";
import {DialogContext} from "../../services/dialogService";
import {StateContext} from "../../stateService";
import APIService from "../../apiService";
import {
    camelCase,
    dateFormatter, dateFormatterAlt, getToday,
    OK, OPERATION_FAILED,
    OPERATION_SUCCESSFUL,
    ROWS_PER_PAGE_OPTIONS,
    SUCCESSFULLY_ADDED,
    SUCCESSFULLY_UPDATED
} from "../../constants";
import FieldAutocomplete from "../fieldAutocomplete";
import FieldTextArea from "../fieldTextArea";
import FieldText from "../fieldText";
import FieldCheckboxWithLabel from "../fieldCheckboxWithLabel";
import FieldAutocompleteNonForm from "../fieldAutocompleteNonForm";
import FieldDateText from "../fieldDateTime";
import IconButton from '@material-ui/core/IconButton';
import FirstPageIcon from '@material-ui/icons/FirstPage';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import LastPageIcon from '@material-ui/icons/LastPage';

const ObituaryGridView = props => 
{
    const isMobile	                                    = useViewport().width < 640;
    const context                                       = useRef( useContext( StateContext ) );
    const dialogContext                                 = useContext( DialogContext );
    const [fields, setFields]                           = useState( [] );
    const [columns, setColumns]                         = useState( [] );
    const [obituary, setObituary]                       = useState( {} );
    const [obituaries, setObituaries]                   = useState( [] );
    const [filteredObituaries, setFilteredObituaries]   = useState( [] );
    const [searchFields, setSearchFields]               = useState( null );
    const [filter, setFilter]                           = useState( null );
    const [selectedRow, setSelectedRow]                 = useState( null );

    const [currentPage, setCurrentPage]                 = useState( 0 );
    const [pageSize, setPageSize]                       = useState( 15 );
    const [rowCount, setRowCount]                       = useState( 0 );
    
    useEffect( () => { refreshData(); }, [] )
    
    const refreshData = ( params ) => {
        APIService( context.current ).getObituaryColumns( function( response ) {
	        
	        setFields( response );
	        
	        const filtered_columns = response.filter( function( row ) { return row.is_grid_table === true; } );

            setColumns( filtered_columns );

            APIService( context.current ).getObituaries( { page: 1, limit: 9999 }, function( data ) { 
                
                const   results         = data.results;
                let     search_fields   = {};
                let     filter_fields   = {};
                let     isPurgeColumn   = false;
                
                // Need to build up autocomplete selectors ...
                for( let x = 0; x < filtered_columns.length; x++ )
                {
                    const filtered_column = filtered_columns[x];

                    search_fields[filtered_column.column_name] = [];
                    filter_fields[filtered_column.column_name] = null;
                    
                    for( let i = 0; i < results.length; i++ )
                    {
                        const   result    = results[i];
                        let     name      = result[filtered_column.column_name];
                        
                        if( filtered_column.type_name === 'datetime' )
                        {
                            name = dateFormatter( name );
                        }
                        else if( filtered_column.type_name === 'bit' )
                        {
                            if( name === true )
                            {
                                name = 'Yes';
                            }
                            else
                            {
                                name = 'No';
                            }
                        }
                        
                        if( !name ){ continue; }
                        
                        // Is there any selected column with "purge" in the name ...
                        if( filtered_column.column_name.toLowerCase().includes( 'purge' ) === true )
                        {
                            // ... default to show non-purged ...
                            isPurgeColumn = true;
                            
                            filter_fields[filtered_column.column_name] = 'No';
                        }
                        
                        // Do not add duplicates ...
                        const exists = search_fields[filtered_column.column_name].filter( function( row ){ return row.name === name; } );
                        
                        if( ( exists === null ) || ( exists.length === 0 ) )
                        {
                            search_fields[filtered_column.column_name].push( { id: i, name: name } );
                        }
                    }

                    search_fields[filtered_column.column_name].sort
                                                                (
                                                                    function( a, b )
                                                                    {
                                                                        const nameA = a.name.toUpperCase();
                                                                        const nameB = b.name.toUpperCase();
                                                                        
                                                                        if( nameA < nameB ){ return -1; }
                                                                        if( nameA > nameB ){ return 1; }
                                                                        
                                                                        return 0;
                                                                    }
                                                                );
                }
                
                if( isPurgeColumn === true )
                {
                    performObituaryFilter( filtered_columns, filter_fields, data.results );
                }
                else
                {
                    setFilteredObituaries( data.results );
                }

                setSearchFields( search_fields );
                setFilter( filter_fields );
                setObituaries( data.results );
                
                setRowCount( data.rowCount );
                
                window.scrollTo( 0, 0 ); 
            } );
	    } );
    };
    
    const onNew = () => { setSelectedRow( null ); setObituary( {} ) };
    
    const onSubmit = ( values, actions ) => 
    {
        const errors = {};
        
        // Check for any required fields prior to submission ...
        for( let i = 0; i < fields.length; i++ )
        {
            const field = fields[i];
            
            if( field.is_identity === true ){ continue; }
            if( field.is_editable !== true ){ continue; }
            if( field.is_required !== true ){ continue; }
            
            if( !values.hasOwnProperty( field.column_name ) )
            {
                errors[field.column_name] = 'Required';
                
                actions.setFieldTouched( field.column_name, true );
            }
        }
        
        if( Object.keys( errors ).length > 0 )
        {
            actions.setSubmitting( false );
            actions.setErrors( errors );
            
            dialogContext.presentDialog( true, OPERATION_FAILED, 'Please check your submission for errors.', null, null, OK, null, null, null );
            
            return;
        }
        
        APIService( context.current )
            .addEditObituary(
                values, 
                function( data ){
                    actions.setSubmitting( false );
                    
                    let message = SUCCESSFULLY_ADDED;
                    
                    if( selectedRow )
                    {
                        message = SUCCESSFULLY_UPDATED;
                    }
                    
                    dialogContext.presentDialog( true, OPERATION_SUCCESSFUL, message, null, null, OK, () => { onNew(); refreshData(); }, null, null );
                },
                function( errors ){
                    
                    actions.setSubmitting( false );
                    actions.setErrors( errors );
                }
            );
	};
    
    const renderFormElements = ( values, errors, touched, handleChange ) => {

        let elements = [];
        
        for( let i = 0; i < fields.length; i++ )
        {
            const   field   = fields[i];
            let     label   = field.column_name;
            const   width   = isMobile ? 250 : '100%';
            
            if( field.is_identity === true ){ continue; }
            if( field.is_editable !== true ){ continue; }
            
            if( ( field.column_description ) && ( field.column_description.length > 0 ) )
            {
                label = field.column_description;
            }
            
            // Is this field conditionally displayed ...
            if( ( field.display_when ) && ( field.display_when.length > 0 ) )
            {
                const   display_rules = field.display_when.split( '=' );
                const   field_name    = display_rules[0];
                const   field_value   = display_rules[1];
                let     field_hidden    = true;
                
                if( values.hasOwnProperty( field_name ) === true )
                {
                    if( values[field_name] !== null )
                    {
                        if( field_value.toLowerCase() === values[field_name].toLowerCase() )
                        {
                            field_hidden = false;
                        }
                    }
                }
                
                if( field_hidden === true )
                {
                    continue;
                }
            }
            
            if( field.column_name === 'client_id' )
            {
                elements.push( <div key={ i }><Field component={ FieldAutocomplete } name={ field.column_name } label={ label } url="Client/query" url_data={ { limit: 9999 } } option_key="id" option_name="client_name" style={ { margin: 5, width: width, display: 'inline-flex' } } /></div> );
            }
            else if( ( field.options ) && ( field.options.length > 0 ) )
            {
                const   field_options   = field.options.split( ',' );
                let     options         = [];

                for( let j = 0; j < field_options.length; j++ )
                {
                    const option = field_options[j].trim();
                    
                    options.push( { id: option, name: option } );
                }
                
                elements.push( <div key={ i }><Field component={ FieldAutocomplete } name={ field.column_name } label={ label } options={ options } option_key="id" option_name="name" style={ { margin: 5, width: width, display: 'inline-flex' } } /></div> );
            }
            else if( field.type_name === 'varchar' )
            {
                if( ( field.max_length >= 200 ) || ( field.max_length < 0 ) )
                {
                    elements.push( <div key={ i }><FieldTextArea id={ field.column_name } label={ label } values={ values } errors={ errors } touched={ touched } onChange={ handleChange } style={ { margin: 5, width: width } } /><br /></div> );
                }
                else
                {
                    elements.push( <div key={ i }><FieldText id={ field.column_name } label={ label } values={ values } errors={ errors } touched={ touched } onChange={ handleChange } style={ { margin: 5, width: width } } /><br /></div> );
                }
            }
            else if( field.type_name === 'bit' )
            {
                if( field.default_value )
                {
                    if( field.default_value === '1' )
                    {
                        values[field.column_name] = true;
                    }
                    else
                    {
                        values[field.column_name] = false;
                    }
                }
                
                elements.push( <div key={ i }><FieldCheckboxWithLabel id={ field.column_name } label={ label } values={ values } errors={ errors } touched={ touched } onChange={ handleChange } /><br /></div> );
            }
            else if( field.type_name === 'datetime' )
            {                
                elements.push( <div key={ i }><Field component={ FieldDateText } name={ field.column_name } label={ label } values={ values } errors={ errors } touched={ touched } onChange={ handleChange } style={ { margin: 5, width: width } } /><br /></div> );
            }
        }

        return elements;
    };

    const onTableRowClick = ( event, data ) => { setSelectedRow( data.id ); setObituary( data ); };
    
    const performObituaryFilter = ( grid_columns, new_filter, filtered_obituaries ) => {
        
        for( let i = 0; i < grid_columns.length; i++ )
        {
            const   column_name     = grid_columns[i].column_name;
            let     filter_value    = new_filter[column_name];
            let     isDateTime      = false;
            let     isBoolean       = false;
            
            if( filter_value === null ){ continue; }
            
            if( grid_columns[i].type_name === 'datetime' )
            {
                filter_value    = dateFormatter( filter_value );
                isDateTime      = true;
            }
            else if( grid_columns[i].type_name === 'bit' )
            {
                isBoolean = true;
            }
            
            filtered_obituaries = filtered_obituaries.filter
                                                        (
                                                            function( row )
                                                            {
                                                                if( isDateTime === true )
                                                                {
                                                                    return dateFormatter( row[column_name] ) === filter_value;
                                                                }
                                                                else if( isBoolean === true )
                                                                {
                                                                    if( row[column_name] === true )
                                                                    {
                                                                        return filter_value === 'Yes';
                                                                    }
                                                                    else
                                                                    {
                                                                        return filter_value === 'No';
                                                                    }
                                                                }
                                                                
                                                                return row[column_name] === filter_value;
                                                            }
                                                        );
        }

        setCurrentPage( 0 );
        setRowCount( filtered_obituaries.length );
        setFilteredObituaries( filtered_obituaries );
    };
    
    const onSearchFieldSelection = ( id, value ) => {
        
        let new_filter          = { ...filter };
        let filtered_obituaries = obituaries;

        if( value == null )
        {
            new_filter[id] = null;
        }
        else
        {
            new_filter[id] = value.name;
        }

        performObituaryFilter( columns, new_filter, filtered_obituaries );
        
        setFilter( new_filter );
    };
    
    const getTableCell = ( row, column ) => {
        
        let cell_value = row[column.column_name];
        
        if( column.type_name === 'datetime' )
        {
            cell_value = dateFormatter( cell_value );
        }
        else if( column.type_name === 'bit' )
        {
            if( cell_value === true )
            {
                cell_value = 'Yes';
            }
            else
            {
                cell_value = 'No';
            }
        }
        
        return <TableCell key={ column.column_name }>{ cell_value }</TableCell>;
    };
    
    const TablePaginationActions = ( props ) =>
    {
        const { count, page, rowsPerPage, onChangePage } = props;

        const handleFirstPageButtonClick    = ( event ) => { onChangePage( event, 0 ); };
        const handleBackButtonClick         = ( event ) => { onChangePage( event, page - 1 ); };
        const handleNextButtonClick         = ( event ) => { onChangePage( event, page + 1 ); };
        const handleLastPageButtonClick     = ( event ) => { onChangePage( event, Math.max( 0, Math.ceil( count / rowsPerPage ) - 1 ) ); };
        const disabledColor                 = 'rgba( 255, 255, 255, 0.3 )';
        
        return (
            <div style={ { flexShrink: 0, marginLeft: 10 } }>
                <IconButton style={ { color: ( page === 0 ) ? disabledColor : 'inherit' } } onClick={ handleFirstPageButtonClick } disabled={ page === 0 }><FirstPageIcon/></IconButton>
                <IconButton style={ { color: ( page === 0 ) ? disabledColor : 'inherit' } } onClick={ handleBackButtonClick } disabled={ page === 0 }><KeyboardArrowLeft/></IconButton>
                <IconButton style={ { color: ( page >= Math.ceil(count / rowsPerPage) - 1 ) ? disabledColor : 'inherit' } } onClick={ handleNextButtonClick } disabled={ page >= Math.ceil( count / rowsPerPage ) - 1 }><KeyboardArrowRight/></IconButton>
                <IconButton style={ { color: ( page >= Math.ceil( count / rowsPerPage ) - 1 ) ? disabledColor : 'inherit' } } onClick={ handleLastPageButtonClick } disabled={ page >= Math.ceil( count / rowsPerPage ) - 1 }><LastPageIcon/></IconButton>
            </div>
        );
    };
    
    const onChangePage = ( event, page ) =>
    {
        setCurrentPage( page );
    };
    
    const onChangeRowsPerPage = ( event ) =>
    {
        setPageSize( parseInt( event.target.value, 10 ) );
    };
    
    return (
        <div style={ { padding: isMobile ? 10 : 25 } }>
            <Paper style={ { padding: isMobile ? 5 : 25, textAlign: 'center' } }>
                <Grid container spacing={ 2 }>
                    <Grid item sm={ 6 }>
                        <Grid container item sm={ 12 } spacing={ 3 }>
                            { searchFields &&
                                <TableContainer component={ Paper }>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                { columns.map( ( column ) => (
                                                    <TableCell key={ column.column_name } style={ { paddingLeft: 2, paddingRight: 2 } }>
                                                        <FieldAutocompleteNonForm id={ column.column_name }  name={ column.column_name } label={ column.column_description } options={ searchFields[column.column_name] } option_key="id" option_name="name" onChange={ onSearchFieldSelection } />
                                                    </TableCell>
                                                ) ) }
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {
                                                filteredObituaries.slice( ( currentPage * pageSize ), ( ( currentPage * pageSize ) + pageSize ) ).map( ( row ) => (
                                                <TableRow key={ row.id } hover selected={ row.id === selectedRow } onClick={ ( event ) => onTableRowClick( event, row ) } style={ { cursor: "pointer" } }>
                                                    { columns.map( ( column ) => (
                                                        getTableCell( row, column )
                                                    ) ) }
                                                </TableRow>
                                            ) ) }
                                        </TableBody>
                                        <TableFooter>
                                            <TableRow>
                                                <TablePagination
                                                    rowsPerPageOptions={ ROWS_PER_PAGE_OPTIONS }
                                                    colSpan={ 5 }
                                                    count={ rowCount }
                                                    rowsPerPage={ pageSize }
                                                    page={ currentPage }
                                                    SelectProps={ { inputProps: { 'aria-label': 'rows per page' }, native: true } }
                                                    onChangePage={ onChangePage }
                                                    onChangeRowsPerPage={ onChangeRowsPerPage }
                                                    ActionsComponent={ TablePaginationActions }/>
                                            </TableRow>
                                        </TableFooter>
                                    </Table>
                                </TableContainer>
                            }
                        </Grid>
                    </Grid>
                    <Grid item sm={ 6 } style={ { borderLeft: '3px solid #1daccc' } }>
                        <Formik enableReinitialize initialValues={ obituary } onSubmit={ onSubmit } validateOnChange={ false } validateOnBlur={ false }>
                            { ( { values, submitForm, isSubmitting, touched, errors, handleChange } ) => (
                            <Form>
                                <ButtonNeutral label="New" onClick={ onNew } style={ { marginRight: 20 } } />
                                <ButtonPositive label="Save" disabled={ isSubmitting } onClick={ submitForm } />
                                <br />
                                <br />
                                { renderFormElements( values, errors, touched, handleChange ) }
                                <br />
                                <ButtonPositive label="Save" disabled={ isSubmitting } onClick={ submitForm } />
                                <br />
                            </Form>
                            ) }
                        </Formik>
                    </Grid>
                </Grid>
            </Paper>
        </div>
    );
}

export default ObituaryGridView;