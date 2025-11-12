import axios from 'axios';
import {camelCase, LOADING} from "./constants";

const APIService = ( context ) =>
{
	const DEV_BASE_URL  = 'http://192.168.1.50:5000/api/';
	const LIVE_BASE_URL	= 'https://www.myfuneralcall.com/api/';
	const api			= axios.create( { baseURL: LIVE_BASE_URL, timeout: 30000, headers: context.token ? { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ context.token }` } : { 'Content-Type': 'application/json' } } );

	const getUsers				= ( query, callback )					=> { post( 'Employee/query', query, function( data ){ callback( data ); } ); };
	const getUser				= ( id, callback )						=> { get( 'Employee/'.concat( id ), function( data ){ callback( data ); } ); };
	const addEditUser			= ( user, callback, error_callback )	=> { post( 'Employee/addEdit', user, callback, error_callback ); };
	const deleteUser			= ( id, callback )						=> { remove( 'Employee/delete/'.concat( id ), function( data ){ callback( true ); }, function( data ){ callback( false ); } ); };
	
	const getClients			= ( query, callback )					=> { post( 'Client/query', query, function( data ){ callback( data ); } ); };
	const getClient				= ( id, callback )						=> { get( 'Client/'.concat( id ), function( data ){ callback( data ); } ); };
	const addEditClient			= ( client, callback, error_callback )	=> { post( 'Client/addEdit', client, callback, error_callback ); };
	const deleteClient			= ( id, callback )						=> { remove( 'Client/delete/'.concat( id ), function( data ){ callback( true ); }, function( data ){ callback( false ); } ); };
	
	const getClientUsers		= ( query, callback )					=> { post( 'ClientUser/query', query, function( data ){ callback( data ); } ); };
	const getClientUser			= ( id, callback )						=> { get( 'ClientUser/'.concat( id ), function( data ){ callback( data ); } ); };
	const addEditClientUser		= ( user, callback, error_callback )	=> { post( 'ClientUser/addEdit', user, callback, error_callback ); };
	const deleteClientUser		= ( id, callback )						=> { remove( 'ClientUser/delete/'.concat( id ), function( data ){ callback( true ); }, function( data ){ callback( false ); } ); };
	const sendNotification		= ( data, callback, error_callback )	=> { post( 'ClientUser/sendNotification', data, callback, error_callback ); };
		
	const getObituaryColumns	= ( callback )							=> { get( 'Obituary', function( data ){ callback( data ); } ); };
	const getObituaries			= ( query, callback )					=> { post( 'Obituary/query', query, function( data ){ callback( data ); } ); };
	const getObituary			= ( id, callback )						=> { get( 'Obituary/'.concat( id ), function( data ){ callback( data ); } ); };
	const addEditObituary		= ( user, callback, error_callback )	=> { post( 'Obituary/addEdit', user, callback, error_callback ); };
	const deleteObituary		= ( id, callback )						=> { remove( 'Obituary/delete/'.concat( id ), function( data ){ callback( true ); }, function( data ){ callback( false ); } ); };
	
	const forgotPassword		= ( data, callback, error_callback )	=> { post( 'User/forgot-password', data, callback, error_callback ); };
	const resetPassword			= ( data, callback, error_callback )	=> { post( 'User/reset-password', data, callback, error_callback ); };
	const authenticate			= ( data, callback, error_callback )	=> {
																				post
																				(
																					'User/authenticate', 
																					data, 
																					function( response )
																					{
																						context.update( 'access', response.access, function(){
																							context.update( 'token', response.token, function(){ callback( response ); } );
																						} );
																					},
																					error_callback
																				);
																			};
	
	const asyncPost				= async ( url, data )					=> { return api.post( url, data ); };

	/* Private Methods */
	const get = ( url, callback, error_callback ) =>
	{
		context.update( LOADING, true );

		api.get( url )
			.then( response =>
			{
				handleSuccess( response, callback );
			} )
			.catch( error =>
			{
				handleError( error, error_callback );
			} );
	};

	const post = ( url, data, callback, error_callback ) =>
	{
		context.update( LOADING, true );

		api.post( url, data )
			.then( response =>
			{
				handleSuccess( response, callback );
			} )
			.catch( error =>
			{
				handleError( error, error_callback );
			} );
	};

	const remove = ( url, callback, error_callback ) =>
	{
		context.update( LOADING, true );

		api.delete( url )
			.then( response =>
			{
				handleSuccess( response, callback );
			} )
			.catch( error =>
			{
				handleError( error, error_callback );
			} );
	};

	const handleSuccess = ( response, callback ) =>
	{
		context.update( LOADING, false );

		callback( response.data.data );
	};

	const handleError = ( error, error_callback ) =>
	{
		context.update( LOADING, false );

		let error_message = null;

		console.log( error.response );

		if( ( error.response ) && ( error.response.data ) )
		{
			if( error.response.data.data.validation_errors )
			{
				const errors = {};

				for( let i = 0; i < error.response.data.data.validation_errors.length; i++ )
				{
					const validationError = error.response.data.data.validation_errors[i];
					
					errors[ camelCase( validationError.field )] = validationError.description;
				}

				error_message = errors;
			}
			else if( error.response.data.data )
			{
				error_message = error.response.data.data;
			}
		}
		else
		{
			error_message = error.message;
		}

		if( error_callback )
		{
			error_callback( error_message );
		}
	};

	return {
		getUsers,
		getUser,
		addEditUser,
		deleteUser,

		getClients,
		getClient,
		addEditClient,
		deleteClient,
		
		getClientUsers,
		getClientUser,
		addEditClientUser,
		deleteClientUser,
		sendNotification,

		getObituaryColumns,
		getObituaries,
		getObituary,
		addEditObituary,
		deleteObituary,

		forgotPassword,
		resetPassword,
		authenticate,

		asyncPost
	};
};

export default APIService;