using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using FuneralCallV2.Classes;
using FuneralCallV2.Classes.email;
using FuneralCallV2.Data;
using FuneralCallV2.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Message = FuneralCallV2.Classes.Message;

namespace FuneralCallV2.Controllers
{
	[ApiController]
	[Route( "api/[controller]" )]
	public class ObituaryController : BaseController
	{
		private FuneralCallDbContext _funeralCallDbContext;

		public ObituaryController( IConfiguration configuration, IHttpContextAccessor httpContextAccessor, IEmailSender emailSender, FuneralCallDbContext funeralCallDbContext ) : base( configuration, httpContextAccessor, emailSender )
		{
			_funeralCallDbContext = funeralCallDbContext;
		}

		[Authorize]
		[HttpGet]
		public IActionResult Get()
		{
			List<ColumnDefinition> columnDefinitions = this.GetColumnDefinitions();
			
			// Adjust field visibility / editability ...
			ColumnDefinition columnDefinitionClientId  = columnDefinitions.Find( cd => cd.column_name == "client_id" );
			ColumnDefinition columnDefinitionIsActive  = columnDefinitions.Find( cd => cd.column_name == "IsActive" );
			ColumnDefinition columnDefinitionStampTime = columnDefinitions.Find( cd => cd.column_name == "StampTime" );
			
			// No one can edit StampTime ...
			columnDefinitionStampTime.is_editable = false;
			
			// For clients, they cannot view/edit client_id, nor IsActive
			if( isClientAuthenticated() == true )
			{
				columnDefinitionClientId.is_visible		= false;
				columnDefinitionClientId.is_editable	= false;

				columnDefinitionIsActive.is_visible		= false;
				columnDefinitionIsActive.is_editable	= false;

				// Client never gets to see this column, even if added ...
				columnDefinitionClientId.is_grid_table = false;
			}
			
			// Add client name column for employees ...
			if( isEmployeeAuthenticated() == true )
			{
				ColumnDefinition columnDefinition   = new ColumnDefinition();
				string           column_description = "client_name";

				if( ( columnDefinitionClientId.column_description != null ) && ( columnDefinitionClientId.column_description.Length > 0 ) )
				{
					column_description = columnDefinitionClientId.column_description;
				}

				columnDefinition.column_description = column_description;
				columnDefinition.column_name        = "client_name";
				columnDefinition.is_identity        = false;
				columnDefinition.is_nullable        = false;
				columnDefinition.max_length         = 256;
				columnDefinition.type_name          = "varchar";
				columnDefinition.is_visible         = true;
				columnDefinition.is_editable        = false;
				columnDefinition.sequence           = columnDefinitionClientId.sequence;
				columnDefinition.column_width       = columnDefinitionClientId.column_width;
				columnDefinition.options            = columnDefinitionClientId.options;
				columnDefinition.display_when       = columnDefinitionClientId.display_when;
				columnDefinition.is_grid_table      = columnDefinitionClientId.is_grid_table;

				columnDefinitions.Insert( 0, columnDefinition );

				// For employees, they cannot view, but they can edit client_id
				columnDefinitionClientId.is_visible  = false;
				columnDefinitionClientId.is_editable = true;
				
				// Default IsActive to 1 / true ...
				columnDefinitionIsActive.default_value = "1";

				// Do not allow both client_name and client_id to appear in grid view ...
				columnDefinitionClientId.is_grid_table = false;
			}

			return ApiResponseHandler.HandleSuccess( columnDefinitions );
		}

		[Authorize]
		[HttpPost]
		[Route( "addEdit" )]
		public IActionResult AddEdit( [FromBody] JObject model )
		{
			List<ColumnDefinition> columnDefinitions    = this.GetColumnDefinitions();
			string                 updateStatement      = BuildUpdateStatement( "client_obituary", columnDefinitions );
			string                 insertStatement      = BuildInsertStatement( "client_obituary", columnDefinitions );
			ClientObituary         clientObituaryBefore = null;
			ClientObituary         clientObituaryAfter  = null;
			int                    id                   = -99;
			int                    transaction_type     = 0;

			using( var command = _funeralCallDbContext.Database.GetDbConnection().CreateCommand() )
			{
				id = Utilities.JsonToType<int>( model.GetValue( "id" ), -99 );

				// If no id, this is an insert ...
				if( id == -99 )
				{
					command.CommandText = insertStatement;

					transaction_type = 4;
				}
				else
				{
					command.CommandText = updateStatement;
					
					clientObituaryBefore = _funeralCallDbContext.ClientObituary.AsNoTracking().FirstOrDefault( o => o.id == id );
					transaction_type     = 3;
				}

				foreach( ColumnDefinition columnDefinition in columnDefinitions )
				{
					object value = null;

					if( columnDefinition.type_name == "varchar" )
					{
						value = Utilities.JsonToType<string>( model.GetValue( columnDefinition.column_name ), null );
					}
					else if( columnDefinition.type_name == "bit" )
					{
						value = Utilities.JsonToType<Boolean>( model.GetValue( columnDefinition.column_name ), false );
					}
					else if( columnDefinition.type_name == "datetime" )
					{
						value = Utilities.JsonToType<DateTime?>( model.GetValue( columnDefinition.column_name ), null );
					}
					else if( columnDefinition.type_name.Contains( "int" ) )
					{
						value = Utilities.JsonToType<int>( model.GetValue( columnDefinition.column_name ), -1 );
					}

					if( value == null )
					{
						value = DBNull.Value;
					}

					// For client users, set their client id, and IsActive ...
					if( ClientUserContext != null )
					{
						if( columnDefinition.column_name.Contains( "client_id" ) == true )
						{
							value = ClientUserContext.client_id;
						}
						else if( columnDefinition.column_name.Contains( "IsActive" ) == true )
						{
							value = 1;
						}
					}
					
					// Auto set StampTime ...
					if( columnDefinition.column_name.Contains( "StampTime" ) == true )
					{
						value = DateTime.UtcNow;
					}

					// Auto set StampInitial ...
					if( columnDefinition.column_name.Contains( "StampInitial" ) == true )
					{
						if( ClientUserContext != null )
						{
							value = ClientUserContext.username;
						}
						else if( EmployeeContext != null )
						{
							value = EmployeeContext.username;
						}
					}
					
					command.Parameters.Add( new SqlParameter( string.Format( "@{0}", columnDefinition.column_name ), value ) );
				}

				if( id == -99 )
				{
					id = (int)command.ExecuteScalar();
				}
				else
				{
					command.ExecuteNonQuery();
				}
			}

			clientObituaryAfter = _funeralCallDbContext.ClientObituary.AsNoTracking().FirstOrDefault( o => o.id == id );
			
			// Log all activity
			// Added = 4
			// Modified = 3
			TransactionLog transactionLog = new TransactionLog();

			transactionLog.transaction_type     = transaction_type;
			transactionLog.transaction_before   = JsonConvert.SerializeObject( clientObituaryBefore );
			transactionLog.transaction_after    = JsonConvert.SerializeObject( clientObituaryAfter );
			transactionLog.transaction_datetime = DateTime.UtcNow;

			if( isEmployeeAuthenticated() )
			{
				transactionLog.transaction_account_id   = EmployeeContext.id.Value;
				transactionLog.transaction_account_type = "Employee";
			}
			else if( isClientAuthenticated() )
			{
				transactionLog.transaction_account_id   = ClientUserContext.id.Value;
				transactionLog.transaction_account_type = "ClientUser";
			}
			
			_funeralCallDbContext.TransactionLog.Add( transactionLog );
			_funeralCallDbContext.SaveChanges();

			return ApiResponseHandler.HandleSuccess( new{ id = id } );
		}

		[Authorize]
		[HttpGet]
		[Route( "{id}" )]
		public IActionResult Get( int id )
		{
			Dictionary<string, object> record          = null;
			string                     selectStatement = BuildSelectStatement( "client_obituary", this.GetColumnNames( "client_obituary", this.GetColumnDefinitions() ) );;
			string                     commandText     = string.Format( "{0} WHERE id = {1}", selectStatement, id );
			
			using( var command = _funeralCallDbContext.Database.GetDbConnection().CreateCommand() )
			{
				command.CommandText = commandText;

				_funeralCallDbContext.Database.OpenConnection();

				using( var result = command.ExecuteReader() )
				{
					var table = new DataTable();

					table.Load( result );

					record = table.AsEnumerable().Select( row => table.Columns.Cast<DataColumn>().ToDictionary( column => column.ColumnName, column => row[column] ) ).ToList().FirstOrDefault();
				}
			}

			return ApiResponseHandler.HandleSuccess( record );
		}

		[Authorize]
		[HttpDelete]
		[Route( "delete/{id}" )]
		public IActionResult Delete( int id )
		{
			ClientObituary clientObituary = _funeralCallDbContext.ClientObituary.SingleOrDefault( o => o.id == id );

			return DeleteRecord( _funeralCallDbContext, clientObituary );
		}
		
		[Authorize]
		[HttpPost]
		[Route( "query" )]
		public IActionResult Query( Search search )
		{
			List<Dictionary<string, object>> rows                   = null;
			string                           commandText            = "";
			string                           selectStatement        = "";
			string                           whereClause            = "";
			string                           orderByClause          = "";
			string                           paginationClause       = "";
			int                              rowCount               = 0;
			List<ColumnDefinition>           columnDefinitions      = this.GetColumnDefinitions();
			List<string>                     columns                = new List<string>( this.GetColumnNames( "client_obituary", columnDefinitions ) );
			List<string>                     columnsList            = new List<string>();
			List<string>                     whereClauseColumnsList = new List<string>();
			List<string>                     whereClauseSearchList  = new List<string>();

			if( search == null )
			{
				search          = new Search();
				search.order_by = new string[]{ "id desc" };
			}
			else
			{
				if( ( search.order_by == null ) || ( search.order_by.Length == 0 ) )
				{
					search.order_by = new string[]{ "id desc" };
				}
			}
			
			if( search.columns != null ){ columnsList.AddRange( search.columns ); }
			
			// For client users, only allow their active results to be returned ...
			if( ClientUserContext != null )
			{
				whereClauseColumnsList.Add( "client_id" );
				whereClauseSearchList.Add( ClientUserContext.client_id.ToString() );
			}

			// Add client name column for employees ...
			if( isEmployeeAuthenticated() == true )
			{
				columns.Add( "client_name" );
			}

			// Default adding IsActive to 1, if not already specified ...
			string columnIsActive = columnsList.FirstOrDefault( c => c.Contains( "IsActive" ) );

			if( columnIsActive == null )
			{
				whereClauseColumnsList.Add( "IsActive" );
				whereClauseSearchList.Add( "1" );
			}
			
			selectStatement		=  BuildSelectStatement( "client_obituary", columns.ToArray() );
			selectStatement		+= ( isEmployeeAuthenticated() == true ) ? " LEFT JOIN client ON client_obituary.client_id = client.id " : "";
			whereClause			=  BuildSearch( search.columns, search.search, search.qualifier, whereClauseColumnsList.ToArray(), whereClauseSearchList.ToArray(), columnDefinitions );
			orderByClause		=  BuildOrderBy( search.order_by );
			paginationClause	=  BuildPagination( ( search.page - 1 ), search.limit );
			commandText			= string.Format( @"WITH TempResult AS 
													(
													    {0}
													    {1}
													),
													     TempCount AS ( SELECT COUNT(*) AS TotalRows FROM TempResult )
													SELECT *
													FROM TempResult, TempCount
													{2}
													{3}",
			                             selectStatement,
			                             whereClause,
			                             orderByClause,
			                             paginationClause );

			using( var command = _funeralCallDbContext.Database.GetDbConnection().CreateCommand() )
			{
				command.CommandText = commandText;

				_funeralCallDbContext.Database.OpenConnection();

				using( var result = command.ExecuteReader() )
				{
					var table = new DataTable();

					table.Load( result );

					if( table.Rows.Count > 0 )
					{
						rowCount = Int32.Parse( table.Rows[0]["TotalRows"].ToString() );
					}

					rows = table.AsEnumerable().Select( row => table.Columns.Cast<DataColumn>().ToDictionary( column => column.ColumnName, column => row[column] ) ).ToList();
				}
			}

			return ApiResponseHandler.HandleSuccess( new { results = rows, currentPage = search.page, pageSize = search.limit, rowCount = rowCount } );
		}
		
		/* Private Methods */
		private List<ColumnDefinition> GetColumnDefinitions()
		{
			List<ColumnDefinition> columnDefinitions = new List<ColumnDefinition>();
			
			using( var command = _funeralCallDbContext.Database.GetDbConnection().CreateCommand() )
			{
				command.CommandText = @"SELECT col.name AS column_name,
										       typ.name AS type_name,
										       col.max_length,
										       col.is_nullable,
										       col.is_identity,
										       ep1.value AS column_description,
										       ep2.value AS column_sequence,
       										   ep3.value AS column_width,
       										   ep4.value AS column_options,
       										   ep5.value AS column_display_when,
       										   ep6.value AS is_grid_table,
       										   ep7.value AS is_required
										FROM sys.columns col
										         LEFT JOIN sys.extended_properties ep1
										                   ON col.object_id = ep1.major_id AND col.column_id = ep1.minor_id AND ep1.name = 'ColumnDescription'
										         LEFT JOIN sys.extended_properties ep2
										                   ON col.object_id = ep2.major_id AND col.column_id = ep2.minor_id AND ep2.name = 'ColumnSequence'
										         LEFT JOIN sys.extended_properties ep3
										                   ON col.object_id = ep3.major_id AND col.column_id = ep3.minor_id AND ep3.name = 'ColumnWidth'
										    	 LEFT JOIN sys.extended_properties ep4
										                   ON col.object_id = ep4.major_id AND col.column_id = ep4.minor_id AND ep4.name = 'Options'
										    	 LEFT JOIN sys.extended_properties ep5
										                   ON col.object_id = ep5.major_id AND col.column_id = ep5.minor_id AND ep5.name = 'DisplayWhen'
										         LEFT JOIN sys.extended_properties ep6
										                   ON col.object_id = ep6.major_id AND col.column_id = ep6.minor_id AND ep6.name = 'GridTable'
										    	LEFT JOIN sys.extended_properties ep7
										                   ON col.object_id = ep7.major_id AND col.column_id = ep7.minor_id AND ep7.name = 'Required'
										         LEFT JOIN sys.tables tab ON col.object_id = tab.object_id
										         LEFT JOIN sys.types typ ON col.user_type_id = typ.user_type_id
										WHERE tab.name = 'client_obituary'
										ORDER BY col.column_id";
				
				_funeralCallDbContext.Database.OpenConnection();
				
				using( var result = command.ExecuteReader() )
				{
					while( result.Read() )
					{
						ColumnDefinition columnDefinition = new ColumnDefinition();
						string           sequence         = Utilities.SafeGetString( result, 6, "99" );
						string           width            = Utilities.SafeGetString( result, 7, "150" );
						string           is_grid_table    = Utilities.SafeGetString( result, 10, "N" ).ToUpper();
						string           is_required      = Utilities.SafeGetString( result, 11, "N" ).ToUpper();

						columnDefinition.column_name        = result.GetString( 0 );
						columnDefinition.type_name          = result.GetString( 1 );
						columnDefinition.max_length         = result.GetInt16( 2 );
						columnDefinition.is_nullable        = result.GetBoolean( 3 );
						columnDefinition.is_identity        = result.GetBoolean( 4 );
						columnDefinition.column_description = Utilities.SafeGetString( result, 5, columnDefinition.column_name );
						columnDefinition.sequence           = Int32.Parse( sequence );
						columnDefinition.column_width       = Int32.Parse( width );
						columnDefinition.options            = Utilities.SafeGetString( result, 8, null );
						columnDefinition.display_when       = Utilities.SafeGetString( result, 9, null );
						columnDefinition.is_grid_table      = is_grid_table.Contains( "Y" );
						columnDefinition.is_required        = is_required.Contains( "Y" );
						columnDefinition.is_visible         = true;
						columnDefinition.is_editable        = true;

						columnDefinitions.Add( columnDefinition );
					}
				}
			}

			return columnDefinitions.OrderBy( c => c.sequence ).ToList();
		}

		private string[] GetColumnNames( string tableName, List<ColumnDefinition> columnDefinitions )
		{
			List<string> columnNames = new List<string>();

			foreach( var columnDefinition in columnDefinitions )
			{
				columnNames.Add( string.Format( "{0}.{1}", tableName, columnDefinition.column_name ) );
			}

			return columnNames.ToArray();
		}
	}
}