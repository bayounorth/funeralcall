using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using FirebaseAdmin.Messaging;
using FuneralCallV2.Classes;
using FuneralCallV2.Classes.email;
using FuneralCallV2.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Message = FuneralCallV2.Classes.Message;

namespace FuneralCallV2.Controllers
{
	public class BaseController : ControllerBase
	{
		private readonly IConfiguration _configuration;
		private readonly IEmailSender   _emailSender;
		private readonly Employee       _employee;
		private readonly ClientUser     _clientUser;

		protected IConfiguration Configuration     => _configuration;
		protected IEmailSender   EmailSender       => _emailSender;
		protected Employee       EmployeeContext   => _employee;
		protected ClientUser     ClientUserContext => _clientUser;

		public BaseController( IConfiguration configuration, IHttpContextAccessor httpContextAccessor, IEmailSender emailSender )
		{
			_configuration = configuration;
			_emailSender   = emailSender;

			if( httpContextAccessor.HttpContext != null )
			{
				if( httpContextAccessor.HttpContext.Items.ContainsKey( "Employee" ) == true )
				{
					_employee = (Employee)httpContextAccessor.HttpContext.Items["Employee"];
				}
				else if( httpContextAccessor.HttpContext.Items.ContainsKey( "ClientUser" ) == true )
				{
					_clientUser = (ClientUser)httpContextAccessor.HttpContext.Items["ClientUser"];
				}
			}
		}

		protected bool isEmployeeAuthenticated()
		{
			return _employee != null;
		}

		protected bool isClientAuthenticated()
		{
			return _clientUser != null;
		}

		protected IActionResult GetRecord<T>( T model ) where T : class
		{
			if ( model == null )
			{
				return ApiResponseHandler.HandleError( Message.RecordNotFound.Value );
			}

			return ApiResponseHandler.HandleSuccess( model );
		}

		protected IActionResult DeleteRecord<T>( DbContext context, T model ) where T : class
		{
			if ( model == null )
			{
				return ApiResponseHandler.HandleError( Message.RecordNotFound.Value );
			}

			context.Set<T>().Remove( model );
			context.SaveChanges();

			return ApiResponseHandler.HandleSuccess( Message.RecordSuccessfullyDeleted.Value );
		}

		protected PagedResult QueryBuilderPagedResult( IQueryable queryable, Search search )
		{
			if( search == null )
			{
				search = new Search();
			}
			
			// Build search ...
			if( ( search.columns != null ) && ( search.search != null ) )
			{
				for ( int i = 0; i < search.columns.Length; i++ )
				{
					queryable = QueryWhereBuilder( queryable, search.exact_match_search, search.columns[i], search.search, i, search.operand );
				}
			}

			// Build order by ...
			if( search.order_by != null )
			{
				for ( int i = 0; i < search.order_by.Length; i++ )
				{
					if( i > 0 )
					{
						queryable = ( (IOrderedQueryable)queryable ).ThenBy( search.order_by[i] );
					}
					else
					{
						queryable = queryable.OrderBy( search.order_by[i] );
					}
				}
			}

			return queryable.PageResult( search.page, search.limit );
		}

		protected IActionResult QueryBuilder( IQueryable queryable, Search search )
		{
			PagedResult result = QueryBuilderPagedResult( queryable, search );

			return ApiResponseHandler.HandleSuccess( new
			                                         {
				                                         results     = result.Queryable,
				                                         currentPage = result.CurrentPage,
				                                         pageSize    = result.PageSize,
				                                         rowCount    = result.RowCount
			                                         } );
		}

		private IQueryable QueryWhereBuilder( IQueryable queryable, Boolean exact_match_search, string column, string[] search, int i, string operand )
		{
			Boolean is_search_array = search.Length > 1;
			string  compare         = null;
			string  search_fragment = null;

			if( is_search_array == true )
			{
				search_fragment = search[i];
			}
			else
			{
				search_fragment = search[0];
			}

			if( operand != null )
			{
				compare = operand;
			}
			else
			{
				if( exact_match_search == true )
				{
					compare = "=";
				}
				else
				{
					compare = "LIKE";
				}
			}

			if( search_fragment != null )
			{
				if( compare == "LIKE" )
				{
					if( column.Contains( "id" ) == true )
					{
						queryable = queryable.Where( String.Format( "{0} = \"{1}\"", column, search_fragment ) );
					}
					else if( column.ToLower().Contains( "is" ) == true )
					{
						queryable = queryable.Where( String.Format( "{0} = \"{1}\"", column, search_fragment ) );
					}
					else
					{
						queryable = queryable.Where( String.Format( "{0}.Contains( @0 )", column ), search_fragment );
					}
				}
				else
				{
					queryable = queryable.Where( String.Format( "{0} {1} \"{2}\"", column, compare, search_fragment ) );
				}
			}

			return queryable;
		}

		protected string BuildSelectStatement( string tableName, string[] columns )
		{
			string selectStatement = "SELECT ";
			int    columnCount     = columns.Length;

			for( int n = 0; n < columnCount; n++ )
			{
				selectStatement += columns[n];

				if( n != ( columnCount - 1 ) )
				{
					selectStatement += ", ";
				}
				else
				{
					selectStatement += " FROM " + tableName;
				}
			}

			return selectStatement;
		}

		private ColumnDefinition FindColumnDefinitionByColumnName( List<ColumnDefinition> columnDefinitions, string column_name )
		{
			ColumnDefinition defaultColumnDefinition = new ColumnDefinition();
			
			foreach( ColumnDefinition columnDefinition in columnDefinitions )
			{
				if( columnDefinition.column_name.CompareTo( column_name ) == 0 )
				{
					return columnDefinition;
				}
			}

			defaultColumnDefinition.type_name = "varchar";

			return defaultColumnDefinition;
		}

		protected string BuildSearch( string[] searchColumns, string[] searchValues, string qualifier, string[] searchColumnsAnd, string[] searchValuesAnd, List<ColumnDefinition> columnDefinitions )
		{
			string where_clause = "";

			if( ( qualifier == null ) || ( qualifier.Length == 0 ) )
			{
				qualifier = "AND";
			}

			if( ( searchColumns != null ) && ( searchColumns.Length > 0 ) )
			{
				where_clause += " WHERE (";

				for( int i = 0; i < searchColumns.Length; i++ )
				{
					int              value            = -1;
					bool             boolValue        = false;
					ColumnDefinition columnDefinition = FindColumnDefinitionByColumnName( columnDefinitions, searchColumns[i] );
					bool             isInteger        = int.TryParse( searchValues[i], out value );
					bool             isBool           = Boolean.TryParse( searchValues[i], out boolValue );

					if( columnDefinition.type_name.CompareTo( "int" ) == 0 )
					{
						where_clause += string.Format( " ( {0} = {1} ) {2}", searchColumns[i], searchValues[i], qualifier );
					}
					else if( columnDefinition.type_name.CompareTo( "bit" ) == 0 )
					{
						where_clause += string.Format( " ( {0} = {1} ) AND", searchColumns[i], boolValue ? 1 : 0 );
					}
					else
					{
						where_clause += string.Format( " ( {0} LIKE '%{1}%' ) {2}", searchColumns[i], searchValues[i], qualifier );
					}
				}

				where_clause = where_clause.Substring( 0, ( where_clause.Length - 3 ) ) + ")";
			}

			// Add in addition "AND" search clauses ...
			if( ( searchColumnsAnd != null ) && ( searchColumnsAnd.Length > 0 ) )
			{
				if( where_clause.Length == 0 )
				{
					where_clause += " WHERE (";
				}
				else
				{
					where_clause += " AND (";
				}
				
				for( int i = 0; i < searchColumnsAnd.Length; i++ )
				{
					int  value     = -1;
					bool isInteger = int.TryParse( searchValuesAnd[i], out value );

					if( isInteger )
					{
						where_clause += string.Format( " ( {0} = {1} ) AND", searchColumnsAnd[i], searchValuesAnd[i] );
					}
					else
					{
						where_clause += string.Format( " ( {0} LIKE '%{1}%' ) AND", searchColumnsAnd[i], searchValuesAnd[i] );
					}
				}

				where_clause = where_clause.Substring( 0, ( where_clause.Length - 3 ) ) + ")";
			}

			return where_clause;
		}

		protected string BuildOrderBy( string[] orderBy )
		{
			return string.Format( " ORDER BY {0}", string.Join( ',' , orderBy ) );
		}

		protected string BuildPagination( int offset, int limit )
		{
			return string.Format( " OFFSET {0} ROWS FETCH NEXT {1} ROWS ONLY", ( offset * limit ), limit );
		}

		protected string BuildUpdateStatement( string tableName, List<ColumnDefinition> columnDefinitions )
		{
			string updateStatement = string.Format( "UPDATE {0} SET ", tableName );
			string whereClause     = "";
			char[] charsToTrim     = { ',', ' ' };

			for( int n = 0; n < columnDefinitions.Count; n++ )
			{
				ColumnDefinition columnDefinition = columnDefinitions[n];
				
				if( columnDefinition.is_identity == true )
				{
					whereClause = string.Format( " WHERE {0} = @{0}", columnDefinition.column_name );
				}
				else
				{
					updateStatement += string.Format( "{0} = @{0}, ", columnDefinition.column_name );
				}
			}

			updateStatement = updateStatement.TrimEnd( charsToTrim );
			
			return updateStatement + whereClause;
		}

		protected string BuildInsertStatement( string tableName, List<ColumnDefinition> columnDefinitions )
		{
			string columnsStatement = "";
			string valuesStatement  = "";
			char[] charsToTrim      = { ',', ' ' };

			for( int n = 0; n < columnDefinitions.Count; n++ )
			{
				ColumnDefinition columnDefinition = columnDefinitions[n];

				if( columnDefinition.is_identity == true ){ continue; }

				columnsStatement += string.Format( "{0}, ", columnDefinition.column_name );
				valuesStatement  += string.Format( "@{0}, ", columnDefinition.column_name );
			}

			columnsStatement = columnsStatement.TrimEnd( charsToTrim );
			valuesStatement  = valuesStatement.TrimEnd( charsToTrim );

			return string.Format( "INSERT INTO {0} ( {1} ) OUTPUT INSERTED.ID VALUES ( {2} )", tableName, columnsStatement, valuesStatement );
		}

		protected string GenerateJwtToken( string id, string userType )
		{
			var tokenHandler	= new JwtSecurityTokenHandler();
			var key		= Encoding.ASCII.GetBytes( Configuration["EncryptionKey"] );
			var tokenDescriptor	= new SecurityTokenDescriptor
			                      {
				                      Subject            = new ClaimsIdentity( new[]{ new Claim( "id", id ), new Claim( "type", userType ) } ),
				                      Expires            = DateTime.UtcNow.AddDays( 90 ),
				                      SigningCredentials = new SigningCredentials( new SymmetricSecurityKey( key ), SecurityAlgorithms.HmacSha256Signature )
			                      };
			var token			= tokenHandler.CreateToken( tokenDescriptor );
			
			return tokenHandler.WriteToken( token );
		}

		protected async Task<string> SendNotification( string deviceToken, string title , string body, string sound, string messageCount, string msgId )
		{
			string result    = Message.NotFound.Value;
			string ios_sound = String.Concat( sound, ".caf" );
			
			Int32.TryParse( messageCount, out int badge );

			var message = new FirebaseAdmin.Messaging.Message()
			              {
				              // Data = new Dictionary<string, string>() { { "title", title }, { "body", body }, { "sound", sound }, { "messageCount", messageCount }, { "msgId", msgId } },
				              Data = new Dictionary<string, string>() { { "messageCount", messageCount }, { "msgId", msgId } },
				              // Notification = new Notification{ Body = body, Title = title },
				              Token   = deviceToken,
				              // Token = "fwR54uXMY0sqqHZpRaZkv2:APA91bF66G4RSC7lXuSXZiETtTId-6r2Iu0715yJ9QlcisbXIJu4ROGrwLF0PO8os1cNqLN9WiIZQ_qUnBwTGUvCJ4lqUWu22-wzyk63uEyJ2XCU0xsnKx_jjgYEg1B232sHcyEVNHrM",
				              Android = new AndroidConfig { Notification = new AndroidNotification { Body = body, Title = title, Sound = sound, ChannelId = sound} },
				              //Priority = Priority.High
				              Apns    = new ApnsConfig { Aps = new Aps { Alert = new ApsAlert { Title = title, Body = body }, Badge = badge, Sound = ios_sound } }
				              // ContentAvailable = true, MutableContent = true
			              };
			
			var messaging = FirebaseMessaging.DefaultInstance;

			try
			{
				result = await messaging.SendAsync( message );
			}
			catch( Exception e )
			{
				result = e.Message;
			}

			return result;
		}
	}
}