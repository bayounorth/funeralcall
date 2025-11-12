import axios from 'axios';

const APIService = ( context ) =>
{
	const LOADING		= 'loading';
	const DEV_BASE_URL	= 'http://192.168.1.50:5000/api/';
	const LIVE_BASE_URL	= 'https://www.myfuneralcall.com/api/';
	const api			= axios.create( { baseURL: LIVE_BASE_URL, timeout: 30000, headers: context.token ? { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ context.token }` } : { 'Content-Type': 'application/json' } } );

	const forgotPassword		= ( data, callback, error_callback )	=> { post( 'User/forgot-password', data, callback, error_callback ); };
	const resetPassword			= ( data, callback, error_callback )	=> { post( 'User/reset-password', data, callback, error_callback ); };
	const authenticate			= ( data, callback, error_callback )	=> {
																				// Add fcmToken...
																				data.fcmToken = context.fcmToken;

																				post
																				(
																					'User/authenticate',
																					data,
																					function( response )
																					{
																						context.update
																								(
																									'token',
																									response.token,
																									function()
																									{
																										context.update
																										(
																											'user',
																											response.user,
																											function()
																											{
																												callback( response );
																											}
																										);
																									}
																								);
																					},
																					error_callback
																				);
																			};

	const getMessages			= ( query, callback, error_callback )	=> { post( 'Message/query', query, callback, error_callback ); };
	const getMessage			= ( id, callback, error_callback )		=> { get( 'Message/'.concat( id ), callback, error_callback ); };
	const markMessagesRead		= ( data, callback, error_callback )	=> { post( 'Message/markMessagesRead', data, callback, error_callback ); };
	const deleteMessages		= ( data, callback, error_callback )	=> { post( 'Message/deleteMessages', data, callback, error_callback ); };
	const confirmMessage		= ( data, callback, error_callback )	=> { post( 'Message/confirmMessage', data, callback, error_callback ); };

	const getObituaryColumns	= ( callback, error_callback )			=> { get( 'Obituary', callback, error_callback ); };
	const getObituaries			= ( query, callback, error_callback )	=> { post( 'Obituary/query', query, callback, error_callback ); };
	const getObituary			= ( id, callback, error_callback )		=> { get( 'Obituary/'.concat( id ), callback, error_callback ); };
	const addEditObituary		= ( data, callback, error_callback )	=> { post( 'Obituary/addEdit', data, callback, error_callback ); };
	const deleteObituary		= ( id, callback )						=> { remove( 'Obituary/delete/'.concat( id ), function( data ){ callback( true ); }, function( data ){ callback( false ); } ); };

	const updateClientUser		= ( data, callback, error_callback )	=> { post( 'MobileApp/updateClientUser', data, callback, error_callback ); };
	const logoutClientUser		= ( data, callback, error_callback )	=> { post( 'MobileApp/logoutClientUser', data, callback, error_callback ); };

	const getClientOffices		= ( query, callback, error_callback )	=> { post( 'ClientOfficeInfo/query', query, callback, error_callback ); };
	const getClientOffice		= ( id, callback, error_callback )		=> { get( 'ClientOfficeInfo/'.concat( id ), callback, error_callback ); };

	const asyncGet				= async ( url, params )					=> { return api.get( url, { params: params } ); };

	/* Private Methods */
	const camelCase = ( str ) =>
	{
		return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
			return index === 0 ? word.toLowerCase() : word.toUpperCase();
		}).replace(/\s+/g, '');
	};

	const isPureObject = ( input ) =>
	{
		return null !== input &&
			typeof input === 'object' &&
			Object.getPrototypeOf( input ).isPrototypeOf( Object );
	};

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

		if( isPureObject( error ) && ( error.response ) && ( error.response.data ) )
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

		console.log( error_message );

		if( error_callback )
		{
			error_callback( error_message );
		}
	};

	return {
		forgotPassword,
		resetPassword,
		authenticate,

		getMessages,
		getMessage,
		markMessagesRead,
		deleteMessages,
		confirmMessage,

		getObituaryColumns,
		getObituaries,
		getObituary,
		addEditObituary,
		deleteObituary,

		updateClientUser,
		logoutClientUser,

		getClientOffices,
		getClientOffice,

		asyncGet
	};
};

export default APIService;
