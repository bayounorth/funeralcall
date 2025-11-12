import {useRef, useContext, useState, useEffect} from "react";
import {StateContext} from "../../../stateService";
import {DialogContext} from "../../../services/dialogService";
import APIService from "../../../apiService";
import {Paper, TextField} from "@material-ui/core";
import {Formik, Form} from 'formik';
import ButtonNeutral from "../../buttonNeutral";
import ButtonPositive from "../../buttonPositive";
import FieldCheckboxWithLabel from "../../fieldCheckboxWithLabel";
import FieldText from "../../fieldText";
import {OK, OPERATION_FAILED, OPERATION_SUCCESSFUL, SUCCESSFULLY_ADDED, SUCCESSFULLY_UPDATED} from "../../../constants";

const ClientUserAddEdit = props =>
{
    const context                                   = useRef( useContext( StateContext ) );
    const dialogContext                             = useContext( DialogContext );
    const [clientUser, setClientUser]               = useState( { id: null, client_id: props.clientId, username: null, password: null, email_address: null, first_name: null, last_name: null, office_number: null, cell_phone_number: null, is_active: false, app_token: null, notifications: false, standard_sound: null, firstcall_sound: null } );
    const [notificationText, setNotificationText]   = useState( '' );
    
    useEffect( () =>
	{
	    if( !props.id ){ return; }
	    
		APIService( context.current ).getClientUser( props.id, function( data ) {

            setClientUser( { id: data.id, client_id: data.client_id, username: data.username, password: null, email_address: data.email_address, first_name: data.first_name, last_name: data.last_name, office_number: data.office_number, cell_phone_number: data.cell_phone_number, is_active: data.is_active, app_token: data.app_token, notifications: data.notifications, standard_sound: data.standard_sound, firstcall_sound: data.firstcall_sound } );
	        
        } );
		
	}, [ props.id ] )
    
    const onCancel = () => { props.onAddEditComplete(); };
    
    const onSubmit = ( values, actions ) => 
    {
        APIService( context.current )
            .addEditClientUser(
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
                    actions.setErrors( errors );
                }
            );
    };
    
    const onSendTestNotification = () =>
    {
        APIService( context.current )
            .sendNotification(
                { client_user_id: clientUser.id, message: notificationText },
                function( response )
                {
                    dialogContext.presentDialog( true, OPERATION_SUCCESSFUL, response, null, null, OK, () => { setNotificationText( '' ); }, null, null );
                },
                function( error )
                {
                    dialogContext.presentDialog( true, OPERATION_FAILED, error, null, null, OK, () => { setNotificationText( '' ); }, null, null );
                }
            );
    };
    
    return (
        <div style={ { padding: 25 } }>
            <Paper style={ { padding: 25 } }>
                <Formik enableReinitialize initialValues={ clientUser } onSubmit={ onSubmit }>
                    { ( { values, submitForm, isSubmitting, touched, errors, handleChange } ) => (
                    <Form>
                        <FieldText id="first_name" label="First Name" values={ values } errors={ errors } touched={ touched } onChange={ handleChange } />
                        <FieldText id="last_name" label="Last Name" values={ values } errors={ errors } touched={ touched } onChange={ handleChange } />
                        <br />
                        <FieldText id="email_address" label="Email Address" values={ values } errors={ errors } touched={ touched } onChange={ handleChange } />
                        <br />
                        <FieldText id="username" label="Username" values={ values } errors={ errors } touched={ touched } onChange={ handleChange } />
                        <FieldText id="password" label="Password" values={ values } type="password" errors={ errors } touched={ touched } onChange={ handleChange } />
                        <br />
                        <FieldText id="office_number" label="Office Number" values={ values } errors={ errors } touched={ touched } onChange={ handleChange } />
                        <FieldText id="cell_phone_number" label="Cell Phone Number" values={ values } errors={ errors } touched={ touched } onChange={ handleChange } />
                        <br />
                        <FieldCheckboxWithLabel id="is_active" label="Is Active?" values={ values } errors={ errors } touched={ touched } onChange={ handleChange } />
                        <br />
                        <br />
                        <ButtonNeutral label="Cancel" disabled={ isSubmitting } onClick={ onCancel } />
                        <ButtonPositive label="Save" disabled={ isSubmitting } onClick={ submitForm } />
                        <br />
                        <br />
                        <FieldText id="app_token" label="Notification Token" values={ values } errors={ errors } touched={ touched } onChange={ handleChange } disabled={ true } />
                        <FieldCheckboxWithLabel id="notifications" label="Allow Notifications?" values={ values } errors={ errors } touched={ touched } onChange={ handleChange } disabled={ true } />
                        <FieldText id="standard_sound" label="Standard Sound" values={ values } errors={ errors } touched={ touched } onChange={ handleChange } disabled={ true } />
                        <FieldText id="firstcall_sound" label="FirstCall Sound" values={ values } errors={ errors } touched={ touched } onChange={ handleChange } disabled={ true } />
                        <br />
                        <br />
                        <TextField label={ 'Notification Text' }
                                   size={ 'medium' }
                                   type={ 'text' }
                                   value={ notificationText }
                                   onChange={ event => setNotificationText( event.target.value ) }
                                   style={ { margin: 5, width: '100%' } }
                                   variant="outlined"/>
                        <br />
                        <br />
                        <ButtonPositive label="Send Test Notification" disabled={ isSubmitting } onClick={ onSendTestNotification } />
                    </Form>
                    ) }
                </Formik>
            </Paper>
        </div>
    );
}

export default ClientUserAddEdit;