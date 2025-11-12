import {useRef, useContext, useState, useEffect} from "react";
import {StateContext} from "../../stateService";
import {DialogContext} from "../../services/dialogService";
import APIService from "../../apiService";
import {Paper} from "@material-ui/core";
import {Formik, Form} from 'formik';
import ButtonNeutral from "../buttonNeutral";
import ButtonPositive from "../buttonPositive";
import FieldCheckboxWithLabel from "../fieldCheckboxWithLabel";
import FieldText from "../fieldText";
import {OK, OPERATION_SUCCESSFUL, SUCCESSFULLY_ADDED, SUCCESSFULLY_UPDATED} from "../../constants";
import ClientUsers from "./clientUsers/clientUsers";

const ClientAddEdit = props =>
{
    const context               = useRef( useContext( StateContext ) );
    const dialogContext         = useContext( DialogContext );
    const [client, setClient]   = useState( { id: null, account_number: null, client_name: null, is_active: false } );
    
    useEffect( () =>
	{
	    if( !props.id ){ return; }

        getClient( props.id );
		
	}, [ props.id ] )
    
    const getClient = ( id ) => {
        APIService( context.current ).getClient( id, function( data ) {

            setClient( { id: data.id, account_number: data.account_number, client_name: data.client_name, is_active: data.is_active } );
	        
        } );
    };
    
    const onCancel = () => { props.onAddEditComplete(); };
    
    const onSubmit = ( values, actions ) => 
    {
        APIService( context.current )
            .addEditClient(
                values, 
                function( data ){
                    actions.setSubmitting( false );
                    
                    let message = SUCCESSFULLY_ADDED;
                    
                    if( client.id )
                    {
                        message = SUCCESSFULLY_UPDATED;
                    }
                    
                    dialogContext.presentDialog( true, OPERATION_SUCCESSFUL, message, null, null, OK, () => { getClient( data.id ); }, null, null );
                },
                function( errors ){
                    
                    actions.setSubmitting( false );
                    actions.setErrors( errors );
                }
            );
    };
    
    return (
        <div style={ { padding: 25 } }>
            <Paper style={ { padding: 25 } }>
                <Formik enableReinitialize initialValues={ client } onSubmit={ onSubmit }>
                    { ( { values, submitForm, isSubmitting, touched, errors, handleChange } ) => (
                    <Form>
                        <FieldText id="account_number" label="Account Number" values={ values } errors={ errors } touched={ touched } onChange={ handleChange } />
                        <br />
                        <FieldText id="client_name" label="Client Name" values={ values } errors={ errors } touched={ touched } onChange={ handleChange } />
                        <br />
                        <FieldCheckboxWithLabel id="is_active" label="Is Active?" values={ values } errors={ errors } touched={ touched } onChange={ handleChange } />
                        <br />
                        <br />
                        <ButtonNeutral label="Cancel" disabled={ isSubmitting } onClick={ onCancel } />
                        <ButtonPositive label="Save" disabled={ isSubmitting } onClick={ submitForm } />
                    </Form>
                    ) }
                </Formik>
                { client.id && 
                    <div style={ { padding: 25 } }>
                        <ClientUsers clientId={ client.id } />
                    </div>
                }
            </Paper>
        </div>
    );
}

export default ClientAddEdit;