import {Avatar, Box, Container, CssBaseline, Link, makeStyles, Typography} from "@material-ui/core";
import {withRouter} from 'react-router-dom'
import {Copyright} from "../constants";
import LockOpenOutlinedIcon from '@material-ui/icons/LockOpenOutlined';
import {Formik, Form} from 'formik';
import {useContext, useEffect, useRef, useState} from "react";
import FieldText from "../components/fieldText";
import ButtonNeutral from "../components/buttonNeutral";
import ButtonPositive from "../components/buttonPositive";
import APIService from "../apiService";
import {StateContext} from "../stateService";

const Login = props => {
	const [user]	= useState( { username: null, password: null } );
	const context	= useRef( useContext( StateContext ) );
	const formRef	= useRef();
	
    const useStyles = makeStyles( ( theme ) => ( {
		root: {
			marginTop:		theme.spacing( 4 ),
			display:		'flex',
			flexDirection:	'column',
			alignItems:		'center'
		},
		avatar: {
			margin:				theme.spacing( 1 ),
			backgroundColor:	theme.palette.primary.main
		}
	} ) );
    
    const classes = useStyles();

	useEffect( () => {
		const listener = event => {
			if( event.code === "Enter" || event.code === "NumpadEnter" )
			{
				event.preventDefault();

				if( formRef.current ){ formRef.current.handleSubmit(); }
			}
		};
		document.addEventListener( "keydown", listener );
		
		return () => { document.removeEventListener( "keydown", listener ); };
	}, [] );

	const onCancel = () => { props.history.push( "/" ); };

	const onSubmit = ( values, actions ) => {
		APIService( context.current )
            .authenticate(
                values, 
                function( data ){
                    actions.setSubmitting( false );
                    
                    props.history.push( data.redirect );
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
					<img src={ `${process.env.PUBLIC_URL}/images/funeral-call-logo.png` } height={ 150 } alt=""/>
				</Box>
				<Avatar className={ classes.avatar }>
					<LockOpenOutlinedIcon/>
				</Avatar>
				<Typography component="h1" variant="h5">Sign In</Typography>
				<Formik enableReinitialize initialValues={ user } onSubmit={ onSubmit } innerRef={ formRef }>
                    { ( { values, submitForm, isSubmitting, touched, errors, handleChange } ) => (
                    <Form style={ { marginTop: 32, display: 'flex', flexDirection: 'column', alignItems: 'center' } }>
						<FieldText id="username" label="Username" values={ values } errors={ errors } touched={ touched } onChange={ handleChange } size={ 'medium' } />
						<br />
                        <FieldText id="password" label="Password" values={ values } type="password" errors={ errors } touched={ touched } onChange={ handleChange } size={ 'medium' } />
						<div style={ { marginTop: 32 } }>
                        	<ButtonNeutral label="Cancel" disabled={ isSubmitting } onClick={ onCancel } />
                        	<ButtonPositive label="Login" disabled={ isSubmitting } onClick={ submitForm } />
						</div>
						<div style={ { marginTop: 32 } }>
							<Link color="inherit" underline="always" href={` ${process.env.PUBLIC_URL}/forgot-password` }>Forgot Password?</Link>
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

export default withRouter( Login );