import {useContext, useEffect, useRef, useState} from "react";
import {Paper} from "@material-ui/core";
import {Formik, Form} from 'formik';
import {StateContext} from "../../stateService";
import APIService from "../../apiService";
import FieldText from "../fieldText";
import FieldCheckboxWithLabel from "../fieldCheckboxWithLabel";
import ButtonPositive from "../buttonPositive";
import ButtonNeutral from "../buttonNeutral";
import {DialogContext} from "../../services/dialogService";
import {OK, OPERATION_FAILED, OPERATION_SUCCESSFUL, SUCCESSFULLY_ADDED, SUCCESSFULLY_UPDATED} from "../../constants";

const UserAddEdit = props =>
{
    const context           = useRef( useContext( StateContext ) );
    const dialogContext     = useContext( DialogContext );
    const [user, setUser]   = useState( { id: null, username: null, password: null, first_name: null, last_name: null, is_active: false, is_admin: false, is_supervisor: false, is_operator: false } );
    
    useEffect( () =>
	{
	    if( !props.id ){ return; }
	    
		APIService( context.current ).getUser( props.id, function( data ) {

            setUser( { id: data.id, username: data.username, password: null, first_name: data.first_name, last_name: data.last_name, is_active: data.is_active, is_admin: data.is_admin, is_supervisor: data.is_supervisor, is_operator: data.is_operator } );
	        
        } );
		
	}, [ props.id ] )
    
    const onCancel = () => { props.onAddEditComplete(); };
    
    const onSubmit = ( values, actions ) =>
    {
        APIService( context.current )
            .addEditUser(
                values, 
                function( data ){
                    actions.setSubmitting( false );
                    
                    let message = SUCCESSFULLY_ADDED;
                    
                    if( props.id )
                    {
                        message = SUCCESSFULLY_UPDATED;
                    }
                    
                    dialogContext.presentDialog( true, OPERATION_SUCCESSFUL, message, null, null, OK, () => { props.onAddEditComplete(); }, null, null );
                },
                function( errors ){
                    actions.setSubmitting( false );
                    
                    if( errors.validation_errors )
                    {
                        actions.setErrors( errors );
                    }
                    else
                    {
                        dialogContext.presentDialog( true, OPERATION_FAILED, errors, null, null, OK, null, null, null );
                    }
                }
            );
    };
    
    return (
        <div style={ { padding: 25 } }>
            <Paper style={ { padding: 25 } }>
                <Formik enableReinitialize initialValues={ user } onSubmit={ onSubmit }>
                    { ( { values, submitForm, isSubmitting, touched, errors, handleChange } ) => (
                    <Form>
                        <FieldText id="first_name" label="First Name" values={ values } errors={ errors } touched={ touched } onChange={ handleChange } />
                        <FieldText id="last_name" label="Last Name" values={ values } errors={ errors } touched={ touched } onChange={ handleChange } />
                        <br />
                        <FieldText id="username" label="Username" values={ values } errors={ errors } touched={ touched } onChange={ handleChange } />
                        <FieldText id="password" label="Password" values={ values } type="password" errors={ errors } touched={ touched } onChange={ handleChange } />
                        <br />
                        <FieldCheckboxWithLabel id="is_active" label="Active?" values={ values } errors={ errors } touched={ touched } onChange={ handleChange } />
                        <br />
                        <FieldCheckboxWithLabel id="is_admin" label="Admin?" values={ values } errors={ errors } touched={ touched } onChange={ handleChange } />
                        <br />
                        <FieldCheckboxWithLabel id="is_supervisor" label="Supervisor?" values={ values } errors={ errors } touched={ touched } onChange={ handleChange } />
                        <br />
                        <FieldCheckboxWithLabel id="is_operator" label="Operator?" values={ values } errors={ errors } touched={ touched } onChange={ handleChange } />
                        <br />
                        <br />
                        <ButtonNeutral label="Cancel" disabled={ isSubmitting } onClick={ onCancel } />
                        <ButtonPositive label="Save" disabled={ isSubmitting } onClick={ submitForm } />
                    </Form>
                    ) }
                </Formik>
            </Paper>
        </div>
    );
}

export default UserAddEdit;