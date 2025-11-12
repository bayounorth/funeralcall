import MomentUtils from '@date-io/moment';
import MomentUTCUtils from './MomentUTCUtils';
import { Platform } from 'react-native';
import APIService from './services/apiService';
import Toast from 'react-native-simple-toast';
import momentLib from 'moment-timezone';

export const LOADING			= 'loading';
export const USERNAME			= 'username';
export const PASSWORD			= 'password';
export const USER			    = 'user';

export const PRIMARY_COLOR		= '#1daccc';
export const SECONDARY_COLOR	= '#19857b';
export const BACKGROUND_COLOR	= '#424242';
export const NEGATIVE_COLOR		= 'rgb( 144, 164, 174 )';
export const TRANSPARENT_COLOR  = '#00000000';
export const ERROR_COLOR        = '#f44336';

export const isAndroid          = Platform.OS === 'android';
export const isIos		        = !isAndroid;

export const SOUNDS             = [
                                    { name: 'Aurora',              id: 'aurora'             },
                                    { name: 'Cool',                id: 'coolnotification'   },
                                    { name: 'Chord',               id: 'chord'              },
                                    { name: 'Circles',             id: 'circles'            },
                                    { name: 'Critical Alert',      id: 'criticalalert'      },
                                    { name: 'First Call',          id: 'firstcall'          },
                                    { name: 'General Message',     id: 'generalmessage'     },
                                    { name: 'General Message 2',   id: 'generalmessage2'    },
                                    { name: 'Incoming',            id: 'incoming'           },
                                    { name: 'iPhone Original',     id: 'iphoneoriginal'     },
                                    { name: 'Notification',        id: 'notification'       },
                                    { name: 'One Lime',            id: 'onelime'            },
                                    { name: 'Red Alert',           id: 'redalert'           },
                                    { name: 'Tone',                id: 'tone'               },
                                    { name: 'Whistle',             id: 'whistle'            }
                                  ];

export const	SOUND_FILES		= 	{
                                        aurora:             require( './assets/sounds/aurora.mp3' ),
                                        coolnotification:   require( './assets/sounds/coolnotification.mp3' ),
                                        chord:              require( './assets/sounds/chord.mp3' ),
                                        circles:            require( './assets/sounds/circles.mp3' ),
                                        criticalalert:      require( './assets/sounds/criticalalert.mp3' ),
                                        firstcall:          require( './assets/sounds/firstcall.mp3' ),
                                        generalmessage:     require( './assets/sounds/generalmessage.mp3' ),
                                        generalmessage2:    require( './assets/sounds/generalmessage2.mp3' ),
                                        incoming:           require( './assets/sounds/incoming.mp3' ),
                                        iphoneoriginal:     require( './assets/sounds/iphoneoriginal.mp3' ),
                                        notification:       require( './assets/sounds/notification.mp3' ),
                                        onelime:            require( './assets/sounds/onelime.mp3' ),
                                        redalert:           require( './assets/sounds/redalert.mp3' ),
                                        tone:               require( './assets/sounds/tone.mp3' ),
                                        whistle:            require( './assets/sounds/whistle.mp3' )
                                    };

export function Copyright()
{
    return ( '©' + new Date().getFullYear() + ' Omni Enterprises, Inc' );
}

export const titleCase = ( s ) =>
    s.replace( /^[-_]*(.)/, ( _, c ) => c.toUpperCase() ).replace( /[-_]+(.)/g, ( _, c ) => ' ' + c.toUpperCase() );

export const formatPhoneNumber = ( phone_number ) =>
{
    if( !phone_number )
    {
        return '';
    }

    phone_number = phone_number.trim();

    phone_number = phone_number.replace( /\D/g,'' );

    if( phone_number.length === 0 )
    {
        return '';
    }

    if( phone_number[0] === '1' )
    {
        phone_number = phone_number.substring( 1, phone_number.length );
    }

    if ( ( phone_number.length === 0 ) || ( phone_number.length !== 10 ) )
    {
        return '';
    }

    return `(${ phone_number.substring( 0, 3 ) }) ${ phone_number.substring( 3, 6 ) }-${ phone_number.substring( 6, 10 ) }`;
};

export const formatPhoneNumberOrNull = ( phone_number ) =>
{
    const formatted_phone_number = formatPhoneNumber( phone_number );

    if( stringHasValue( formatted_phone_number ) )
    {
        return formatted_phone_number;
    }

    return null;
};

export const stringHasValue = ( string ) =>
{
    if( !string ){ return false; }

    if( string.trim().length === 0 ){ return false; }

    if( string.toLowerCase().localeCompare( 'notfound' ) === 0 ){ return false; }

    return true;
};

export const dateFormatter = ( value ) =>
{
    if( !value ){ return ''; }

    return new Date( value ).toLocaleDateString( 'en-US' );
};

export const timeFormatter = ( value ) =>
{
    if ( value == null )
    {
        return '';
    }

    const moment = new momentLib.tz( value, 'HH:mm:ss', 'America/New_York' );

    return moment.local().format( 'h:mm A ' );
};

export const timeFormatterAlt = ( value ) =>
{
    if ( value == null )
    {
        return '';
    }

    const moment = new momentLib.tz( value, 'M/D/yyyy h:mm A', 'UTC' );

    return moment.local().format( 'M/D/yyyy h:mm A ' ) + momentLib.tz( momentLib.tz.guess() ).zoneAbbr();
};

export const dateFormatterAlt = ( value ) =>
{
    if( value == null ){ return ''; }

    const moment    = new MomentUtils();
    const date      = moment.date( value );

    return date.format( 'MM/DD/yyyy' );
};

export const getToday = () =>
{
    const moment = new MomentUtils();

    return moment.date();
};

export const toMomentOrToday = ( value ) =>
{
    if( !value ){ return getToday(); }

    const moment = new MomentUTCUtils();

    return moment.date( value );
};

export const shallowEqual = ( object1, object2 ) =>
{
    const keys1 = Object.keys( object1 );
    const keys2 = Object.keys( object2 );

    if( keys1.length !== keys2.length ){ return false; }

    for( let key of keys1 )
    {
        if( object1[key] !== object2[key] ){ return false; }
    }

    return true;
};

export const dialNumber = ( context, callingFromNumber, numberToCall, callerIdNumber ) =>
{
    context.current.update( LOADING, true );

    APIService( context.current )
        .asyncGet
            (
                'https://onthegocall.funeralcall.com/app/click_to_call/click_to_call.php',
                {
                    'key':				'df68dfef-dbfc-4ff4-9411-6a79666f112a',
                    'src_cid_name':		'',
                    'src_cid_number':   callerIdNumber,
                    'dest_cid_name':	'',
                    'dest_cid_number':	callerIdNumber,
                    'src':              callingFromNumber,
                    'dest':				numberToCall,
                    'auto_answer':		'',
                    'rec':				'false',
                    'ringback':			'us-ring'
                }
            )
        .then
            (
                function( response ){ context.current.update( LOADING, false ); }
            )
        .catch
            (
                function( error )
                {
                    context.current.update( LOADING, false );

                    Toast.show( 'Unable to make call, please try again.', Toast.LONG, [ 'RCTModalHostViewController', 'UIAlertController' ] );
                }
            );
};

export const buildSMSMessage = ( message ) =>
{
    let messageToSend = '';

    if ( message.callerFirstName || message.callerLastName )
    {
        messageToSend += message.callerFirstName + ' ' + message.callerLastName + '\n';
    }

    if ( message.facilityName )
    {
        messageToSend += message.facilityName + '\n';
    }

    if ( message.companyName )
    {
        messageToSend += message.companyName + '\n';
    }

    if ( message.badgeNumber )
    {
        messageToSend += 'Badge Number: ' + message.badgeNumber + '\n';
    }

    if ( message.phone )
    {
        messageToSend += 'Primary Phone: ' + message.phone + ( message.ext ? ' x' + message.ext : '' ) + ( message.numberType ? ' (' + message.numberType + ')' : '' ) + '\n';
    }

    if ( message.altPhone )
    {
        messageToSend += 'Alternate Phone: ' + message.altPhone + ( message.numberType2 ? ' (' + message.numberType2 + ')' : '' ) + '\n';
    }

    if ( message.dateStamp || message.timeStamp )
    {
        messageToSend += message.dateStamp + ' ' + message.timeStamp + '\n';
    }

    messageToSend += ( message.personRequested ? 'Person Requested: ' + message.personRequested + '\n' : '' );
    messageToSend += ( message.callerEmailAddress ? 'Email Address: ' + message.callerEmailAddress + '\n' : '' );
    messageToSend += ( message.caseType ? 'Case Type: ' + message.caseType + '\n' : '' );
    messageToSend += ( message.caseNumber ? 'Case Number: ' + message.caseNumber + '\n' : '' );
    messageToSend += ( message.incidentInformation ? 'Incident Information: ' + message.incidentInformation + '\n' : '' );
    messageToSend += ( message.causeOfIncident ? 'Cause Of Incident: ' + message.causeOfIncident + '\n' : '' );
    messageToSend += ( message.chapel ? 'Chapel: ' + message.chapel + '\n' : '' );
    messageToSend += ( message.notes ? 'Notes: ' + message.notes + '\n' : '' );
    messageToSend += ( message.serviceAgreement ? 'Service Agreement: ' + message.serviceAgreement + '\n' : '' );
    messageToSend += ( message.serviceAddress ? 'Service Address: ' + message.serviceAddress + '\n' : '' );
    messageToSend += ( message.contactPersonOnSiteName ? 'Contact Person On Site: ' + message.contactPersonOnSiteName + '\n' : '' );
    messageToSend += ( message.contactPersonOnSitePhone ? 'Contact Person Phone: ' + message.contactPersonOnSitePhone + '\n' : '' );
    messageToSend += ( message.productInformation ? 'Product Information: ' + message.productInformation + '\n' : '' );
    messageToSend += ( message.productRequests ? 'Product Requests: ' + message.productRequests + '\n' : '' );
    messageToSend += ( message.orderQuantity ? 'Order Quantity: ' + message.orderQuantity + '\n' : '' );
    messageToSend += ( message.ticketNumber ? 'Ticket Number: ' + message.ticketNumber + '\n' : '' );
    messageToSend += ( message.icb ? 'ICB: ' + message.icb + '\n' : '' );
    messageToSend += ( message.isCall ? 'Is Call: ' + message.isCall + '\n' : '' );
    messageToSend += ( message.currentClient ? 'Current Client: ' + message.currentClient + '\n' : '' );
    messageToSend += ( message.hearAboutUs ? 'Hear About Us: ' + message.hearAboutUs + '\n' : '' );
    messageToSend += ( message.solicitor ? 'Solicitor: ' + message.solicitor + '\n' : '' );
    messageToSend += ( message.receiveTextMessages ? 'Receive Text Messages: ' + message.receiveTextMessages + '\n' : '' );
    messageToSend += ( message.relayCall ? 'Relay Call: ' + message.relayCall + '\n' : '' );
    messageToSend += ( message.petName ? 'Pet Name: ' + message.petName + '\n' : '' );
    messageToSend += ( message.petWeight ? 'Pet Weight: ' + message.petWeight + '\n' : '' );
    messageToSend += ( message.petHeight ? 'Pet Height: ' + message.petHeight + '\n' : '' );
    messageToSend += ( message.petType ? 'Pet Type: ' + message.petType + '\n' : '' );
    messageToSend += ( message.petBreed ? 'Pet Breed: ' + message.petBreed + '\n' : '' );
    messageToSend += ( message.petOwnerName ? 'Pet Owner Name: ' + message.petOwnerName + '\n' : '' );
    messageToSend += ( message.petOwnerNumber ? 'Pet Owner Number: ' + message.petOwnerNumber + '\n' : '' );
    messageToSend += ( message.petOwnerAddress ? 'Pet Owner Address: ' + message.petOwnerAddress + '\n' : '' );
    messageToSend += ( message.petLocation ? 'Pet Location: ' + message.petLocation + '\n' : '' );
    messageToSend += ( message.pickUpLocation ? 'Pick-Up Location: ' + message.pickUpLocation + '\n' : '' );
    messageToSend += ( message.petCremationType ? 'Pet Cremation Type: ' + message.petCremationType + '\n' : '' );
    messageToSend += ( message.decName ? 'Deceased: ' + message.decName + '\n' : '' );
    messageToSend += ( message.decMiddleName ? 'Dec Middle Name: ' + message.decMiddleName + '\n' : '' );
    messageToSend += ( message.maidenName ? 'Maiden Name: ' + message.maidenName + '\n' : '' );
    messageToSend += ( message.decLoc ? 'Dec Location: ' + message.decLoc + '\n' : '' );
    messageToSend += ( message.decAtResidence ? 'Dec At Residence: ' + message.decAtResidence + '\n' : '' );
    messageToSend += ( message.locAdd ? 'Location Address: ' + message.locAdd + '\n' : '' );
    messageToSend += ( message.phoToDecLoc ? 'Phone To Dec Location: ' + message.phoToDecLoc + '\n' : '' );
    messageToSend += ( message.decAge ? 'Dec Age: ' + message.decAge + '\n' : '' );
    messageToSend += ( message.decGender ? 'Dec Gender: ' + message.decGender + '\n' : '' );
    messageToSend += ( message.tod ? 'Time of Death: ' + message.tod + '\n' : '' );
    messageToSend += ( message.dod ? 'Date of Death: ' + message.dod + '\n' : '' );
    messageToSend += ( message.cod ? 'Cause of Death: ' + message.cod + '\n' : '' );
    messageToSend += ( message.dob ? 'Date of Birth: ' + message.dob + '\n' : '' );
    messageToSend += ( message.ssn ? 'Social Security Number: ' + message.ssn + '\n' : '' );
    messageToSend += ( message.weight ? 'Weight: ' + message.weight + '\n' : '' );
    messageToSend += ( message.height ? 'Height: ' + message.height + '\n' : '' );
    messageToSend += ( message.decHomeAddress ? 'Dec Home Address: ' + message.decHomeAddress + '\n' : '' );
    messageToSend += ( message.decVeteran ? 'Dec Veteran: ' + message.decVeteran + '\n' : '' );
    messageToSend += ( message.nok ? 'Next of Kin: ' + message.nok + '\n' : '' );
    messageToSend += ( message.nokPho ? 'Next of Kin Phone: ' + message.nokPho + '\n' : '' );
    messageToSend += ( message.numberType3 ? 'Number Type: ' + message.numberType3 + '\n' : '' );
    messageToSend += ( message.nokAltPho ? 'NOK Alt Phone: ' + message.nokAltPho + '\n' : '' );
    messageToSend += ( message.nokAdd ? 'Next of Kin Address: ' + message.nokAdd + '\n' : '' );
    messageToSend += ( message.famWaiting ? 'Family Waiting: ' + message.famWaiting + '\n' : '' );
    messageToSend += ( message.readyForRelease ? 'Ready For Release: ' + message.readyForRelease + '\n' : '' );
    messageToSend += ( message.attPhy ? 'Attending Physician: ' + message.attPhy + '\n' : '' );
    messageToSend += ( message.phyDC ? 'Physician Signing Death Cert: ' + message.phyDC + '\n' : '' );
    messageToSend += ( message.drNotified ? 'Doctor Notified: ' + message.drNotified + '\n' : '' );
    messageToSend += ( message.drPho ? 'Doctor Phone: ' + message.drPho + '\n' : '' );
    messageToSend += ( message.drAdd ? 'Doctor Address: ' + message.drAdd + '\n' : '' );
    messageToSend += ( message.coronerName ? 'Coroner Name: ' + message.coronerName + '\n' : '' );
    messageToSend += ( message.coronerPhoneNumber ? 'Coroner Phone Number: ' + message.coronerPhoneNumber + '\n' : '' );
    messageToSend += ( message.coronerNotified ? 'Coroner Notified: ' + message.coronerNotified + '\n' : '' );
    messageToSend += ( message.njaNumber ? 'NJA Number: ' + message.njaNumber + '\n' : '' );
    messageToSend += ( message.autopsyRequested ? 'Autopsy Requested: ' + message.autopsyRequested + '\n' : '' );
    messageToSend += ( message.permissionToEmbalm ? 'Permission To Embalm: ' + message.permissionToEmbalm + '\n' : '' );
    messageToSend += ( message.deathCallBackTonight ? 'Death Call Back Tonight: ' + message.deathCallBackTonight + '\n' : '' );
    messageToSend += ( message.pronouncingPerson ? 'Pronouncing Person: ' + message.pronouncingPerson + '\n' : '' );
    messageToSend += ( message.pronouncementTime ? 'Pronouncement Time: ' + message.pronouncementTime + '\n' : '' );
    messageToSend += ( message.etaDataInfo ? 'ETA Data Info: ' + message.etaDataInfo + '\n' : '' );
    messageToSend += ( message.decOnHospiceCare ? 'Dec On Hospice Care: ' + message.decOnHospiceCare + '\n' : '' );
    messageToSend += ( message.hospiceNotified ? 'Hospice Notified: ' + message.hospiceNotified + '\n' : '' );
    messageToSend += ( message.decRemainOvernightInMorgue ? 'Dec Remain Overnight In Morgue: ' + message.decRemainOvernightInMorgue + '\n' : '' );
    messageToSend += ( message.bodyReleasedFromDonorServices ? 'Body Released From Donor Services: ' + message.bodyReleasedFromDonorServices + '\n' : '' );
    messageToSend += ( message.removalPersonnelNeeded ? 'Removal Personnel Needed: ' + message.removalPersonnelNeeded + '\n' : '' );
    messageToSend += ( message.stairsAtDeceasedLocation ? 'Stairs At Deceased Location: ' + message.stairsAtDeceasedLocation + '\n' : '' );
    messageToSend += ( message.countyDeathOccurredIn ? 'County Death Occurred In: ' + message.countyDeathOccurredIn + '\n' : '' );
    messageToSend += ( message.removalNoticeInformation ? 'Removal Notice Information: ' + message.removalNoticeInformation + '\n' : '' );
    messageToSend += ( message.apartmentNumber ? 'Apartment Number: ' + message.apartmentNumber + '\n' : '' );
    messageToSend += ( message.attorneyName ? 'Attorney Name: ' + message.attorneyName + '\n' : '' );
    messageToSend += ( message.bestTimeToContact ? 'Best Time To Contact: ' + message.bestTimeToContact + '\n' : '' );
    messageToSend += ( message.businessHours ? 'Business Hours: ' + message.businessHours + '\n' : '' );
    messageToSend += ( message.calleraddress ? 'Caller address: ' + message.calleraddress + '\n' : '' );
    messageToSend += ( message.certifyingPhysician ? 'Certifying Physician: ' + message.certifyingPhysician + '\n' : '' );
    messageToSend += ( message.claimFiled ? 'Claim Filed: ' + message.claimFiled + '\n' : '' );
    messageToSend += ( message.customerNumber ? 'Customer Number: ' + message.customerNumber + '\n' : '' );
    messageToSend += ( message.dateofIncident ? 'Date of Incident: ' + message.dateofIncident + '\n' : '' );
    messageToSend += ( message.decDonor ? 'Is Deceased A Donor: ' + message.decDonor + '\n' : '' );
    messageToSend += ( message.emergencyContact ? 'Emergency Contact: ' + message.emergencyContact + '\n' : '' );
    messageToSend += ( message.emergencyContactRelationship ? 'Emergency Contact Relationship: ' + message.emergencyContactRelationship + '\n' : '' );
    messageToSend += ( message.employerAddress ? 'Employer Address: ' + message.employerAddress + '\n' : '' );
    messageToSend += ( message.employerName ? 'Employer Name: ' + message.employerName + '\n' : '' );
    messageToSend += ( message.employmentDuration ? 'Employment Duration: ' + message.employmentDuration + '\n' : '' );
    messageToSend += ( message.employmentStatus ? 'Employment Status: ' + message.employmentStatus + '\n' : '' );
    messageToSend += ( message.expenses ? 'Expenses: ' + message.expenses + '\n' : '' );
    messageToSend += ( message.incidentType ? 'Incident Type: ' + message.incidentType + '\n' : '' );
    messageToSend += ( message.income ? 'Income: ' + message.income + '\n' : '' );
    messageToSend += ( message.injuriesSustained ? 'Injuries Sustained: ' + message.injuriesSustained + '\n' : '' );
    messageToSend += ( message.insuranceCompanyName ? 'Insurance Company Name: ' + message.insuranceCompanyName + '\n' : '' );
    messageToSend += ( message.hospicePresent ? 'Hospice Present: ' + message.hospicePresent + '\n' : '' );
    messageToSend += ( message.jobTitle ? 'Job Title: ' + message.jobTitle + '\n' : '' );
    messageToSend += ( message.maritalStatus ? 'Marital Status: ' + message.maritalStatus + '\n' : '' );
    messageToSend += ( message.medicalInsurance ? 'Medical Insurance: ' + message.medicalInsurance + '\n' : '' );
    messageToSend += ( message.numberofVisits ? 'Number of Visits: ' + message.numberofVisits + '\n' : '' );
    messageToSend += ( message.password ? 'Password: ' + message.password + '\n' : '' );
    messageToSend += ( message.patientName ? 'Patient Name: ' + message.patientName + '\n' : '' );
    messageToSend += ( message.priorIncidents ? 'Prior Incidents: ' + message.priorIncidents + '\n' : '' );
    messageToSend += ( message.serialNumber ? 'Serial Number: ' + message.serialNumber + '\n' : '' );
    messageToSend += ( message.serviceDates ? 'Service Dates: ' + message.serviceDates + '\n' : '' );
    messageToSend += ( message.serviceType ? 'Service Type: ' + message.serviceType + '\n' : '' );
    messageToSend += ( message.spouse ? 'Spouse: ' + message.spouse + '\n' : '' );
    messageToSend += ( message.storeNumber ? 'Store Number: ' + message.storeNumber + '\n' : '' );
    messageToSend += ( message.supervisorContactNumber ? 'Supervisor Contact Number: ' + message.supervisorContactNumber + '\n' : '' );
    messageToSend += ( message.supervisorName ? 'Supervisor Name: ' + message.supervisorName + '\n' : '' );
    messageToSend += ( message.username ? 'Username: ' + message.username + '\n' : '' );
    messageToSend += ( message.visitTimes ? 'Visit Times: ' + message.visitTimes + '\n' : '' );
    messageToSend += ( message.workOrderNumber ? 'Work Order Number: ' + message.workOrderNumber + '\n' : '' );
    messageToSend += ( message.donorNumber ? 'Donor Number: ' + message.donorNumber + '\n' : '' );

    // Open Fields
    for( let i = 1; i <= 10; i++ )
    {
        // eslint-disable-next-line no-eval
        if( eval( 'message.openField' + i ) )
        {
            // eslint-disable-next-line no-eval
            messageToSend += eval( 'message.openField' + i ) + '\n';
        }
    }

    messageToSend += ( message.callerID ? 'Caller ID: ' + message.callerID + '\n' : '' );
    messageToSend += ( message.receptionistInitials ? 'Receptionist Initials: ' + message.receptionistInitials + '\n' : '' );

    return messageToSend;
};
