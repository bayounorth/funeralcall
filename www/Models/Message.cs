using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FuneralCallV2.Models
{
	[Table( "MessageData" )]
	public class MessageData
	{
		public string    AcctNum                       { get; set; }
		public string    InfinityAccountNumber         { get; set; }
		public string    ClientName                    { get; set; }
		public string    ClientPassword                { get; set; }
		public DateTime? DateStamp                     { get; set; }
		public TimeSpan? TimeStamp                     { get; set; }
		public string    CallerFirstName               { get; set; }
		public string    CallerLastName                { get; set; }

		[NotMapped]
		public string    CallerFullName                { get; set; }
		public string    MessageConfirmed              { get; set; }
		public string    MessageResponseField          { get; set; }
		public string    ConfirmedBy                   { get; set; }
		public string    ConfirmedTime                 { get; set; }
		public string    ConfirmedTimeUpdated          { get; set; }
		public string    FacilityName                  { get; set; }
		public string    CompanyName                   { get; set; }
		public string    BadgeNumber                   { get; set; }
		public string    Phone                         { get; set; }
		public string    NumberType                    { get; set; }
		public string    Ext                           { get; set; }
		public string    AltPhone                      { get; set; }
		public string    NumberType2                   { get; set; }
		public string    PersonRequested               { get; set; }
		public string    CallerEmailAddress            { get; set; }
		public string    CaseType                      { get; set; }
		public string    CaseNumber                    { get; set; }
		public string    IncidentInformation           { get; set; }
		public string    CauseOfIncident               { get; set; }
		public string    Chapel                        { get; set; }
		public string    Notes                         { get; set; }
		public string    ServiceAgreement              { get; set; }
		public string    ServiceAddress                { get; set; }
		public string    ContactPersonOnSiteName       { get; set; }
		public string    ContactPersonOnSitePhone      { get; set; }
		public string    ProductInformation            { get; set; }
		public string    ProductRequests               { get; set; }
		public string    OrderQuantity                 { get; set; }
		public string    TicketNumber                  { get; set; }
		public string    ICB                           { get; set; }
		public string    ISCall                        { get; set; }
		public string    CurrentClient                 { get; set; }
		public string    HearAboutUs                   { get; set; }
		public string    Solicitor                     { get; set; }
		public string    ReceiveTextMessages           { get; set; }
		public string    RelayCall                     { get; set; }
		public Decimal?  UniqueCallID                  { get; set; }
		public string    CallerID                      { get; set; }
		public string    PetName                       { get; set; }
		public string    PetWeight                     { get; set; }
		public string    PetHeight                     { get; set; }
		public string    PetType                       { get; set; }
		public string    PetBreed                      { get; set; }
		public string    PetOwnerName                  { get; set; }
		public string    PetOwnerNumber                { get; set; }
		public string    PetOwnerAddress               { get; set; }
		public string    PetLocation                   { get; set; }
		public string    PickUpLocation                { get; set; }
		public string    PetCremationType              { get; set; }
		public string    DecName                       { get; set; }
		public string    DecMiddleName                 { get; set; }
		public string    MaidenName                    { get; set; }
		public string    DecLoc                        { get; set; }
		public string    DecAtResidence                { get; set; }
		public string    LocAdd                        { get; set; }
		public string    PhoToDecLoc                   { get; set; }
		public string    DecAge                        { get; set; }
		public string    DecGender                     { get; set; }
		public string    TOD                           { get; set; }
		public string    DOD                           { get; set; }
		public string    COD                           { get; set; }
		public string    DOB                           { get; set; }
		public string    SSN                           { get; set; }
		public string    Weight                        { get; set; }
		public string    Height                        { get; set; }
		public string    DecHomeAddress                { get; set; }
		public string    DecVeteran                    { get; set; }
		public string    NOK                           { get; set; }
		public string    NOKPho                        { get; set; }
		public string    NumberType3                   { get; set; }
		public string    NOKAltPho                     { get; set; }
		public string    NOKAdd                        { get; set; }
		public string    FamWaiting                    { get; set; }
		public string    ReadyForRelease               { get; set; }
		public string    AttPhy                        { get; set; }
		public string    PhyDC                         { get; set; }
		public string    DrNotified                    { get; set; }
		public string    DrPho                         { get; set; }
		public string    DrAdd                         { get; set; }
		public string    CoronerName                   { get; set; }
		public string    CoronerPhoneNumber            { get; set; }
		public string    CoronerNotified               { get; set; }
		public string    NJANumber                     { get; set; }
		public string    AutopsyRequested              { get; set; }
		public string    PermissionToEmbalm            { get; set; }
		public string    DeathCallBackTonight          { get; set; }
		public string    PronouncingPerson             { get; set; }
		public string    PronouncementTime             { get; set; }
		public string    ETADataInfo                   { get; set; }
		public string    DecOnHospiceCare              { get; set; }
		public string    HospiceNotified               { get; set; }
		public string    DecRemainOvernightInMorgue    { get; set; }
		public string    BodyReleasedFromDonorServices { get; set; }
		public string    RemovalPersonnelNeeded        { get; set; }
		public string    StairsAtDeceasedLocation      { get; set; }
		public string    CountyDeathOccurredIn         { get; set; }
		public string    RemovalNoticeInformation      { get; set; }
		public string    ReceptionistInitials          { get; set; }
		public string    IsRead                        { get; set; }
		public string    PushSent                      { get; set; }
		public string    IsDeathCall                   { get; set; }
		public string    Disposition                   { get; set; }
		public string    MessageHistory                { get; set; }
		public string    Special1                      { get; set; }
		public string    Special2                      { get; set; }
		public string    Special3                      { get; set; }
		public string    Special4                      { get; set; }
		public string    Special5                      { get; set; }
		public string    OnCall                        { get; set; }

		[Key]
		[DatabaseGenerated( DatabaseGeneratedOption.Identity )]
		public int       msgID                         { get; set; }
		
		public string    ApartmentNumber               { get; set; }
		public string    AttorneyName                  { get; set; }
		public string    BestTimeToContact             { get; set; }
		public string    BusinessHours                 { get; set; }
		public string    Calleraddress                 { get; set; }
		public string    CertifyingPhysician           { get; set; }
		public string    ClaimFiled                    { get; set; }
		public string    CustomerNumber                { get; set; }
		public string    DateofIncident                { get; set; }
		public string    DecDonor                      { get; set; }
		public string    EmergencyContact              { get; set; }
		public string    EmergencyContactRelationship  { get; set; }
		public string    EmployerAddress               { get; set; }
		public string    EmployerName                  { get; set; }
		public string    EmploymentDuration            { get; set; }
		public string    EmploymentStatus              { get; set; }
		public string    Expenses                      { get; set; }
		public string    IncidentType                  { get; set; }
		public string    Income                        { get; set; }
		public string    InjuriesSustained             { get; set; }
		public string    InsuranceCompanyName          { get; set; }
		public string    HospicePresent                { get; set; }
		public string    JobTitle                      { get; set; }
		public string    MaritalStatus                 { get; set; }
		public string    MedicalInsurance              { get; set; }
		public string    NumberofVisits                { get; set; }
		public string    Password                      { get; set; }
		public string    PatientName                   { get; set; }
		public string    PriorIncidents                { get; set; }
		public string    SerialNumber                  { get; set; }
		public string    ServiceDates                  { get; set; }
		public string    ServiceType                   { get; set; }
		public string    Spouse                        { get; set; }
		public string    StoreNumber                   { get; set; }
		public string    SupervisorContactNumber       { get; set; }
		public string    SupervisorName                { get; set; }
		public string    Username                      { get; set; }
		public string    VisitTimes                    { get; set; }
		public string    WorkOrderNumber               { get; set; }
		public string    DonorNumber                   { get; set; }
		public string    OpenField1                    { get; set; }
		public string    OpenField2                    { get; set; }
		public string    OpenField3                    { get; set; }
		public string    OpenField4                    { get; set; }
		public string    OpenField5                    { get; set; }
		public string    OpenField6                    { get; set; }
		public string    OpenField7                    { get; set; }
		public string    OpenField8                    { get; set; }
		public string    OpenField9                    { get; set; }
		public string    OpenField10                   { get; set; }
		public string    PushSentNew                   { get; set; }

		[NotMapped]
		public string    marked_death_call             { get; set; }
		
		[NotMapped]
		public string    DateStampFormatted            { get; set; }
		
		[NotMapped]
		public string    TimeStampFormatted            { get; set; }
	}
}