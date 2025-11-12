import {Avatar, Box, Container, CssBaseline, makeStyles, Typography} from "@material-ui/core";
import {withRouter, useParams} from 'react-router-dom'
import {Copyright, OK, OPERATION_SUCCESSFUL} from "../constants";
import VpnKeyOutlinedIcon from '@material-ui/icons/VpnKeyOutlined';
import {Formik, Form} from 'formik';
import {useContext, useRef, useState} from "react";
import FieldText from "../components/fieldText";
import ButtonNeutral from "../components/buttonNeutral";
import ButtonPositive from "../components/buttonPositive";
import APIService from "../apiService";
import {StateContext} from "../stateService";
import {DialogContext} from "../services/dialogService";

const ResetPassword = props => {
	const { token }		= useParams();
	const [user]		= useState( { password: null, confirm_password: null, token: null } );
	const context		= useRef( useContext( StateContext ) );
    const dialogContext	= useContext( DialogContext );
	
    const useStyles = makeStyles( ( theme ) => ( {
		root: {
			marginTop:		theme.spacing( 4 ),
			display:		'flex',
			flexDirection:	'column',
			alignItems:		'center'
		},
		avatar: {
			margin:				theme.spacing( 1 ),
			backgroundColor:	theme.palette.primary.main,
		}
	} ) );
    
    const classes = useStyles();

	const onCancel = () => { props.history.push( "/login" ) };

	const onSubmit = ( values, actions ) => {
		
		values.token = token;
		
		APIService( context.current )
            .resetPassword(
                values, 
                function( data ){
                    actions.setSubmitting( false );
                    
                    dialogContext.presentDialog( true, OPERATION_SUCCESSFUL, "Password successfully changed.", null, null, OK, () => { onCancel(); }, null, null );
                },
                function( errors ){
                	
                    actions.setSubmitting( false );
                    actions.setErrors( errors );
                }
            );
	};

	return (
		<Container component="main" maxWidth="sm">
			<CssBaseline/>
			<div className={ classes.root }>
				<Box sm={ 4 } md={ 7 }>
					<img src={ `${process.env.PUBLIC_URL}/images/funeral-call-logo.png` } height={ 150 } alt="" />
				</Box>
				<Avatar className={ classes.avatar }>
					<VpnKeyOutlinedIcon/>
				</Avatar>
				<Typography component="h1" variant="h5">Reset Password</Typography>
				<Typography component="h5" style={ { marginTop: 15, textAlign: 'center', color: 'white' } }>Please enter your new password.</Typography>
				<Formik enableReinitialize initialValues={ user } onSubmit={ onSubmit }>
                    { ( { values, submitForm, isSubmitting, touched, errors, handleChange } ) => (
                    <Form style={ { marginTop: 32, display: 'flex', flexDirection: 'column', alignItems: 'center' } }>
                        <FieldText id="password" label="Password" values={ values } type="password" errors={ errors } touched={ touched } onChange={ handleChange } size={ 'medium' } />
						<br />
						<FieldText id="confirm_password" label="Confirm Password" values={ values } type="password" errors={ errors } touched={ touched } onChange={ handleChange } size={ 'medium' } />
						<br />
						<div style={ { marginTop: 32 } }>
                        	<ButtonNeutral label="Cancel" disabled={ isSubmitting } onClick={ onCancel } />
                        	<ButtonPositive label="Submit" disabled={ isSubmitting } onClick={ submitForm } />
						</div>
					</Form>
					) }
				</Formik>
			</div>
			<Box mt={ 8 }>
				<Copyright/>
			</Box>
		</Container>
	);
}

export default withRouter( ResetPassword );