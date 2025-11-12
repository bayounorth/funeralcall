import React, { useContext, useEffect, useRef, useState } from 'react';
import { Linking, PermissionsAndroid, Pressable, SafeAreaView, ScrollView, Share, View } from 'react-native';
import { BACKGROUND_COLOR, buildSMSMessage, dialNumber, formatPhoneNumberOrNull, isAndroid, PRIMARY_COLOR, stringHasValue, timeFormatterAlt, TRANSPARENT_COLOR } from '../constants';
import FCTopNavigation from '../components/fcTopNavigation';
import FCHeader from '../components/fcHeader';
import FCButton from '../components/fcButton';
import { FloatingMenu } from 'react-native-floating-action-menu';
import { Icon } from '@ui-kitten/components';
import FCLabel from '../components/fcLabel';
import FCMessageDetailItem from '../components/fcMessageDetailItem';
import APIService from '../services/apiService';
import { StateContext } from '../services/stateService';
import DialogInput from '../dialogs/dialogInput';
import Toast from 'react-native-simple-toast';
import DialogSaveContact from '../dialogs/dialogSaveContact';
import DialogOKCancel from '../dialogs/dialogOKCancel';
import * as SMS from 'expo-sms';
import DialogContactList from '../dialogs/dialogContactList';
import DialogCallPrompt from '../dialogs/dialogCallPrompt';
import Contacts from 'react-native-contacts';

export default function MessageDetailScreen( { route, navigation } )
{
	const context														= useRef( useContext( StateContext ) );
	const [ isMenuOpen, setIsMenuOpen ]									= useState( false );
	const [ isConfimed, setIsConfimed ]									= useState( false );
	const [ message, setMessage ]										= useState( {} );
	const [ modalVisible, setModalVisible ]								= useState( false );
	const [ dialogSaveContactVisible, setDialogSaveContactVisible ]		= useState( false );
	const [ modalDeleteConfirmVisible, setModalDeleteConfirmVisible ]	= useState( false );
	const [ modalContactListVisible, setModalContactListVisible ]		= useState( false );
	const [ modalCallPromptVisible, setModalCallPromptVisible ]			= useState( false );
	const [ numberToCall, setNumberToCall ]								= useState( null );
	const [ menuItems, setMenuItems ]									= useState( [ { label: '' }, { label: '' } ] );

	const iconSize							= 25;
	const BackButton						= ( props ) => ( <FCButton { ...props } label={ '< Back' } labelStyle={ { fontSize: 22, marginLeft: 10 } } onPress={ onBackButtonPress } /> );
	const onBackButtonPress					= () => { navigation.replace( 'Messages' ); };
	const handleMenuToggle					= ( isOpen ) => { setIsMenuOpen( isOpen ); };
	const onCancelDialogPress				= () => { setModalVisible( false ); };
	const onConfirmPress					= () => { setModalVisible( true ); };
	const onCancelDialogSaveContactPress	= () => { setDialogSaveContactVisible( false ); };
	const onCancelDeleteMessageDialogPress	= () => { setModalDeleteConfirmVisible( false ); };
	const onCancelContactListDialogPress	= () => { setModalContactListVisible( false ); };
	const onCallPromptCancelPress			= () => { setModalCallPromptVisible( false ); };

	useEffect( () => {

		getMessage();

		if( isAndroid )
		{
			PermissionsAndroid
				.check( PermissionsAndroid.PERMISSIONS.WRITE_CONTACTS )
				.then( function( result )
				{
					if( result )
					{
						let menuItemsLocal = [...menuItems];

						menuItemsLocal.push( { label: '' } );
						menuItemsLocal.push( { label: '' } );

						setMenuItems( menuItemsLocal );
					}
				} );
		}
		else
		{
			Contacts
				.checkPermission()
				.then( function( result )
				{
					if( result === Contacts.PERMISSION_AUTHORIZED )
					{
						let menuItemsLocal = [...menuItems];

						menuItemsLocal.push( { label: '' } );
						menuItemsLocal.push( { label: '' } );

						setMenuItems( menuItemsLocal );
					}
				} );
		}

	}, [ route.params ] );

	const getMessage = () =>
	{
		APIService( context.current )
			.getMessage(
				route.params.msgID,
				function( data )
				{
					setMessage( data );

					if( ( data.messageConfirmed ) && ( data.messageConfirmed === 'Yes' ) )
					{
						setIsConfimed( true );
					}
				} );
	};

	const handleItemPress = ( item, index ) =>
	{
		setIsMenuOpen( false );

		if( menuItems.length === 2 )
		{
			switch( index )
			{
				case 0:		// Trash ...
				{
					setModalDeleteConfirmVisible( true );
					break;
				}
				case 1:		// Share ...
				{
					Share.share( { message: buildSMSMessage( message ) } ).then( function( sharedAction ) {} );
					break;
				}
			}
		}
		else
		{
			switch( index )
			{
				case 0:		// Trash ...
				{
					setModalDeleteConfirmVisible( true );
					break;
				}
				case 1:		// SMS ...
				{
					SMS.isAvailableAsync()
						.then
						(
							function( isAvailable )
							{
								if( isAvailable )
								{
									setModalContactListVisible( true );
								}
								else
								{
									Toast.show( 'SMS is not available on this phone', Toast.LONG, [ 'RCTModalHostViewController', 'UIAlertController' ] );
								}
							}
						);

					break;
				}
				case 2:		// Share ...
				{
					Share.share( { message: buildSMSMessage( message ) } ).then( function( sharedAction ) {} );
					break;
				}
				case 3:		// Save contact ...
				{
					setDialogSaveContactVisible( true );
					break;
				}
			}
		}
	};

	const renderMenuIcon = ( menuState ) =>
	{
		const { menuButtonDown } = menuState;

		if( isMenuOpen || menuButtonDown )
		{
			return <Icon name="close" fill="#ffffff" style={ { height: iconSize, width: iconSize } }/>;
		}

		return <Icon name="more-horizontal" fill="#ffffff" style={ { height: iconSize, width: iconSize } }/>;
	};

	const renderItemIcon = ( item, index, menuState ) =>
	{
		if( menuItems.length === 2 )
		{
			switch( index )
			{
				case 0:
				{
					return <Icon name="trash-2" fill="#ffffff" style={ { height: iconSize, width: iconSize } }/>;
				}
				case 1:
				{
					return <Icon name="share" fill="#ffffff" style={ { height: iconSize, width: iconSize } }/>;
				}
			}
		}
		else
		{
			switch( index )
			{
				case 0:
				{
					return <Icon name="trash-2" fill="#ffffff" style={ { height: iconSize, width: iconSize } }/>;
				}
				case 1:
				{
					return <Icon name="paper-plane" fill="#ffffff" style={ { height: iconSize, width: iconSize } }/>;
				}
				case 2:
				{
					return <Icon name="share" fill="#ffffff" style={ { height: iconSize, width: iconSize } }/>;
				}
				case 3:
				{
					return <Icon name="person" fill="#ffffff" style={ { height: iconSize, width: iconSize } }/>;
				}
			}
		}
	};

	const onLinkPress = ( link ) =>
	{
		if( link.includes( '@' ) )
		{
			Linking.openURL( `mailto:${ link }?subject=FuneralCall` );
		}
		else
		{
			setNumberToCall( link );

			if( context.current.user.cell_phone_number || context.current.user.office_number )
			{
				setModalCallPromptVisible( true );
			}
			else
			{
				Linking.openURL( `tel:${ link }` );
			}
		}
	};

	const onOKDialogPress = ( text ) =>
	{
		setModalVisible( false );

		setTimeout( () =>
		{
			APIService( context.current )
			.confirmMessage(
				{ msgID: route.params.msgID, messageResponseField: text },
				function( data )
				{
					Toast.show( 'Message Confirmed Successfully', Toast.LONG, [ 'RCTModalHostViewController', 'UIAlertController' ] );

					getMessage();
				},
				function( error )
				{
					Toast.show( 'Failed To Confirm Message', Toast.LONG, [ 'RCTModalHostViewController', 'UIAlertController' ] );
				} );

		}, 1000 );
	};

	const onOKDialogSaveContactPress = ( contact ) =>
	{
		if( ( !contact.firstName ) || ( !contact.lastName ) || ( !contact.phone ) )
		{
			Toast.show( 'First name, last name, and phone number are required.', Toast.LONG, [ 'RCTModalHostViewController', 'UIAlertController' ] );
			return;
		}

		setDialogSaveContactVisible( false );

		Contacts.addContact
					(
				{
							familyName:		contact.lastName,
							givenName:		contact.firstName,
							phoneNumbers:	[ { label: 'mobile', number: contact.phone } ]
						}
					)
					.then
					(
						function( result )
						{
							context.current.getContacts( function()
							{
								Toast.show( 'Contact Saved Successfully', Toast.LONG, [ 'RCTModalHostViewController', 'UIAlertController' ] );
							} );
						}
					)
					.catch
					(
						function( error )
						{
							Toast.show( 'Error, failed to save contact.', Toast.LONG, [ 'RCTModalHostViewController', 'UIAlertController' ] );
						}
					);
	};

	const onOKDeleteMessageDialogPress = () =>
	{
		setModalDeleteConfirmVisible( false );

		setTimeout( () =>
		{
			APIService( context.current ).deleteMessages( [ message.msgID ], function( data ){ onBackButtonPress(); } );
		}, 1000 );
	};

	const onOKContactListDialogPress = ( contact ) =>
	{
		setModalContactListVisible( false );

		SMS.sendSMSAsync
			(
				contact.phone,
				buildSMSMessage( message )
			)
			.then
			(
				function( response ){}
			)
			.catch
			(
				function( error ){}
			);
	};

	const onCellNumberPress = () =>
	{
		setModalCallPromptVisible( false );

		Linking.openURL( `tel:${ numberToCall }` );
	};

	const onOfficeNumberPress = () =>
	{
		setModalCallPromptVisible( false );

		dialNumber( context, context.current.user.cell_phone_number, numberToCall, context.current.user.office_number );
	};

	const buildCallerName = ( callerFirstName, callerLastName ) =>
	{
		let callerName = '';

		if( callerFirstName )
		{
			callerName = callerFirstName;
		}

		if( callerLastName )
		{
			callerName += ' ' + callerLastName;
		}

		if( callerName.length === 0 )
		{
			callerName = 'No Name Given';
		}

		return callerName;
	};

	return (
		<SafeAreaView style={ { flex: 1, backgroundColor: BACKGROUND_COLOR } }>
			<FCTopNavigation navigation={ navigation } accessoryLeft={ accessoryLeftProps => <BackButton { ...accessoryLeftProps } /> } />
			<FCHeader title={ 'Message Detail' }/>

			{ message.msgID &&
				<>
					<ScrollView style={ { flex: 1, backgroundColor: '#ffffff', borderRadius: 5, margin: 10 } }>

					<FCMessageDetailItem title={ buildCallerName( message.callerFirstName, message.callerLastName ) } viewStyle={ { marginTop: 10, marginBottom: 0 } }/>
					<FCMessageDetailItem message={ message.dateStampFormatted + ' ' + message.timeStampFormatted } viewStyle={ { marginTop: 0, marginBottom: 10 } }/>

					{ stringHasValue( message.facilityName ) && <FCMessageDetailItem title={ 'Facility' } message={ message.facilityName }/> }
					{ stringHasValue( message.companyName ) && <FCMessageDetailItem title={ 'Company' } message={ message.companyName }/> }
					{ stringHasValue( message.badgeNumber ) && <FCMessageDetailItem title={ 'Badge Number' } message={ message.badgeNumber }/> }
					{ stringHasValue( message.phone ) && <FCMessageDetailItem title={ 'Phone' } message={ formatPhoneNumberOrNull( message.phone ) } link={ message.phone } onPress={ ( l ) => onLinkPress( l ) }/> }
					{ stringHasValue( message.ext ) && <FCMessageDetailItem title={ 'Ext' } message={ message.ext }/> }
					{ stringHasValue( message.numberType ) && <FCMessageDetailItem title={ 'Number Type' } message={ message.numberType }/> }
					{ stringHasValue( message.altPhone ) && <FCMessageDetailItem title={ 'Alternate Phone' } message={ formatPhoneNumberOrNull( message.altPhone ) } link={ message.altPhone } onPress={ ( l ) => onLinkPress( l ) }/> }
					{ stringHasValue( message.numberType2 ) && <FCMessageDetailItem title={ 'Number Type 2' } message={ message.numberType2 }/> }
					{ stringHasValue( message.notes ) && <FCMessageDetailItem title={ 'Message' } message={ message.notes }/> }
					{ stringHasValue( message.customerNumber ) && <FCMessageDetailItem title={ 'Customer Number' } message={ message.customerNumber }/> }
					{ stringHasValue( message.dateofIncident ) && <FCMessageDetailItem title={ 'Date of Incident' } message={ message.dateofIncident }/> }
					{ stringHasValue( message.decDonor ) && <FCMessageDetailItem title={ 'Is Deceased A Donor' } message={ message.decDonor }/> }
					{ stringHasValue( message.personRequested ) && <FCMessageDetailItem title={ 'Person Requested' } message={ message.personRequested }/> }
					{ stringHasValue( message.callerEmailAddress ) && <FCMessageDetailItem title={ 'Email Address' } message={ message.callerEmailAddress } link={ message.callerEmailAddress } onPress={ ( l ) => onLinkPress( l ) }/> }
					{ stringHasValue( message.calleraddress ) && <FCMessageDetailItem title={ 'Caller Address' } message={ message.calleraddress }/> }
					{ stringHasValue( message.caseType ) && <FCMessageDetailItem title={ 'Case Type' } message={ message.caseType }/> }
					{ stringHasValue( message.caseNumber ) && <FCMessageDetailItem title={ 'Case Number' } message={ message.caseNumber }/> }
					{ stringHasValue( message.incidentInformation ) && <FCMessageDetailItem title={ 'Incident Information' } message={ message.incidentInformation }/> }
					{ stringHasValue( message.causeOfIncident ) && <FCMessageDetailItem title={ 'Cause Of Incident' } message={ message.causeOfIncident }/> }
					{ stringHasValue( message.chapel ) && <FCMessageDetailItem title={ 'Chapel' } message={ message.chapel }/> }
					{ stringHasValue( message.serviceAgreement ) && <FCMessageDetailItem title={ 'Service Agreement' } message={ message.serviceAgreement }/> }
					{ stringHasValue( message.serviceAddress ) && <FCMessageDetailItem title={ 'Service Address' } message={ message.serviceAddress }/> }
					{ stringHasValue( message.apartmentNumber ) && <FCMessageDetailItem title={ 'Apartment Number' } message={ message.apartmentNumber }/> }
					{ stringHasValue( message.contactPersonOnSiteName ) && <FCMessageDetailItem title={ 'Contact Person On Site' } message={ message.contactPersonOnSiteName }/> }
					{ stringHasValue( message.contactPersonOnSitePhone ) && <FCMessageDetailItem title={ 'Contact Person Phone' } message={ formatPhoneNumberOrNull( message.contactPersonOnSitePhone ) } link={ message.contactPersonOnSitePhone } onPress={ ( l ) => onLinkPress( l ) }/> }
					{ stringHasValue( message.emergencyContact ) && <FCMessageDetailItem title={ 'Emergency Contact' } message={ message.emergencyContact }/> }
					{ stringHasValue( message.emergencyContactRelationship ) && <FCMessageDetailItem title={ 'Emergency Contact Relationship' } message={ message.emergencyContactRelationship }/> }
					{ stringHasValue( message.employerAddress ) && <FCMessageDetailItem title={ 'Employer Address' } message={ message.employerAddress }/> }
					{ stringHasValue( message.employerName ) && <FCMessageDetailItem title={ 'Employer Name' } message={ message.employerName }/> }
					{ stringHasValue( message.employmentDuration ) && <FCMessageDetailItem title={ 'Employment Duration' } message={ message.employmentDuration }/> }
					{ stringHasValue( message.employmentStatus ) && <FCMessageDetailItem title={ 'Employment Status' } message={ message.employmentStatus }/> }
					{ stringHasValue( message.expenses ) && <FCMessageDetailItem title={ 'Expenses' } message={ message.expenses }/> }
					{ stringHasValue( message.incidentType ) && <FCMessageDetailItem title={ 'Incident Type' } message={ message.incidentType }/> }
					{ stringHasValue( message.income ) && <FCMessageDetailItem title={ 'Income' } message={ message.income }/> }
					{ stringHasValue( message.injuriesSustained ) && <FCMessageDetailItem title={ 'Injuries Sustained' } message={ message.injuriesSustained }/> }
					{ stringHasValue( message.insuranceCompanyName ) && <FCMessageDetailItem title={ 'Insurance Company Name' } message={ message.insuranceCompanyName }/> }
					{ stringHasValue( message.hospicePresent ) && <FCMessageDetailItem title={ 'Hospice Present' } message={ message.hospicePresent }/> }
					{ stringHasValue( message.jobTitle ) && <FCMessageDetailItem title={ 'Job Title' } message={ message.jobTitle }/> }
					{ stringHasValue( message.maritalStatus ) && <FCMessageDetailItem title={ 'Marital Status' } message={ message.maritalStatus }/> }
					{ stringHasValue( message.medicalInsurance ) && <FCMessageDetailItem title={ 'Medical Insurance' } message={ message.medicalInsurance }/> }
					{ stringHasValue( message.numberofVisits ) && <FCMessageDetailItem title={ 'Number of Visits' } message={ message.numberofVisits }/> }
					{ stringHasValue( message.username ) && <FCMessageDetailItem title={ 'Username' } message={ message.username }/> }
					{ stringHasValue( message.password ) && <FCMessageDetailItem title={ 'Password' } message={ message.password }/> }
					{ stringHasValue( message.patientName ) && <FCMessageDetailItem title={ 'Patient Name' } message={ message.patientName }/> }
					{ stringHasValue( message.priorIncidents ) && <FCMessageDetailItem title={ 'Prior Incidents' } message={ message.priorIncidents }/> }
					{ stringHasValue( message.serialNumber ) && <FCMessageDetailItem title={ 'Serial Number' } message={ message.serialNumber }/> }
					{ stringHasValue( message.serviceDates ) && <FCMessageDetailItem title={ 'Service Dates' } message={ message.serviceDates }/> }
					{ stringHasValue( message.serviceType ) && <FCMessageDetailItem title={ 'Service Type' } message={ message.serviceType }/> }
					{ stringHasValue( message.storeNumber ) && <FCMessageDetailItem title={ 'Store Number' } message={ message.storeNumber }/> }
					{ stringHasValue( message.supervisorContactNumber ) && <FCMessageDetailItem title={ 'Supervisor Contact Number' } message={ formatPhoneNumberOrNull( message.supervisorContactNumber ) } link={ message.supervisorContactNumber } onPress={ ( l ) => onLinkPress( l ) }/> }
					{ stringHasValue( message.supervisorName ) && <FCMessageDetailItem title={ 'Supervisor Name' } message={ message.supervisorName }/> }
					{ stringHasValue( message.visitTimes ) && <FCMessageDetailItem title={ 'Visit Times' } message={ message.visitTimes }/> }
					{ stringHasValue( message.workOrderNumber ) && <FCMessageDetailItem title={ 'Work Order Number' } message={ message.workOrderNumber }/> }
					{ stringHasValue( message.productInformation ) && <FCMessageDetailItem title={ 'Product Information' } message={ message.productInformation }/> }
					{ stringHasValue( message.productRequests ) && <FCMessageDetailItem title={ 'Product Requests' } message={ message.productRequests }/> }
					{ stringHasValue( message.orderQuantity ) && <FCMessageDetailItem title={ 'Order Quantity' } message={ message.orderQuantity }/> }
					{ stringHasValue( message.ticketNumber ) && <FCMessageDetailItem title={ 'Ticket Number' } message={ message.ticketNumber }/> }
					{ stringHasValue( message.ticketStatus ) && <FCMessageDetailItem title={ 'Ticket Status' } message={ message.ticketStatus }/> }
					{ stringHasValue( message.icb ) && <FCMessageDetailItem title={ 'ICB' } message={ message.icb }/> }
					{ stringHasValue( message.isCall ) && <FCMessageDetailItem title={ 'Is Call' } message={ message.isCall }/> }
					{ stringHasValue( message.currentClient ) && <FCMessageDetailItem title={ 'Current Client' } message={ message.currentClient }/> }
					{ stringHasValue( message.hearAboutUs ) && <FCMessageDetailItem title={ 'Hear About Us' } message={ message.hearAboutUs }/> }
					{ stringHasValue( message.solicitor ) && <FCMessageDetailItem title={ 'Solicitor' } message={ message.solicitor }/> }
					{ stringHasValue( message.spouse ) && <FCMessageDetailItem title={ 'Spouse' } message={ message.spouse }/> }
					{ stringHasValue( message.receiveTextMessages ) && <FCMessageDetailItem title={ 'Receive Text Messages' } message={ message.receiveTextMessages }/> }
					{ stringHasValue( message.relayCall ) && <FCMessageDetailItem title={ 'Relay Call' } message={ message.relayCall }/> }
					{ stringHasValue( message.petName ) && <FCMessageDetailItem title={ 'Pet Name' } message={ message.petName }/> }
					{ stringHasValue( message.petWeight ) && <FCMessageDetailItem title={ 'Pet Weight' } message={ message.petWeight }/> }
					{ stringHasValue( message.petHeight ) && <FCMessageDetailItem title={ 'Pet Height' } message={ message.petHeight }/> }
					{ stringHasValue( message.petType ) && <FCMessageDetailItem title={ 'Pet Type' } message={ message.petType }/> }
					{ stringHasValue( message.petBreed ) && <FCMessageDetailItem title={ 'Pet Breed' } message={ message.petBreed }/> }
					{ stringHasValue( message.petOwnerName ) && <FCMessageDetailItem title={ 'Pet Owner Name' } message={ message.petOwnerName }/> }
					{ stringHasValue( message.petOwnerNumber ) && <FCMessageDetailItem title={ 'Pet Owner Number' } message={ formatPhoneNumberOrNull( message.petOwnerNumber ) } link={ message.petOwnerNumber } onPress={ ( l ) => onLinkPress( l ) }/> }
					{ stringHasValue( message.petOwnerAddress ) && <FCMessageDetailItem title={ 'Pet Owner Address' } message={ message.petOwnerAddress }/> }
					{ stringHasValue( message.petLocation ) && <FCMessageDetailItem title={ 'Pet Location' } message={ message.petLocation }/> }
					{ stringHasValue( message.pickUpLocation ) && <FCMessageDetailItem title={ 'Pick Up Location' } message={ message.pickUpLocation }/> }
					{ stringHasValue( message.petCremationType ) && <FCMessageDetailItem title={ 'Pet Cremation Type' } message={ message.petCremationType }/> }
					{ stringHasValue( message.decName ) && <FCMessageDetailItem title={ 'Deceased' } message={ message.decName }/> }
					{ stringHasValue( message.decMiddleName ) && <FCMessageDetailItem title={ 'Deceased Middle Name' } message={ message.decMiddleName }/> }
					{ stringHasValue( message.maidenName ) && <FCMessageDetailItem title={ 'Maiden Name' } message={ message.maidenName }/> }
					{ stringHasValue( message.decLoc ) && <FCMessageDetailItem title={ 'Deceased Location' } message={ message.decLoc }/> }
					{ stringHasValue( message.decAtResidence ) && <FCMessageDetailItem title={ 'Deceased At Residence' } message={ message.decAtResidence }/> }
					{ stringHasValue( message.locAdd ) && <FCMessageDetailItem title={ 'Location Address' } message={ message.locAdd }/> }
					{ stringHasValue( message.phoToDecLoc ) && <FCMessageDetailItem title={ 'Phone To Deceased Location' } message={ formatPhoneNumberOrNull( message.phoToDecLoc ) } link={ message.phoToDecLoc } onPress={ ( l ) => onLinkPress( l ) }/> }
					{ stringHasValue( message.decAge ) && <FCMessageDetailItem title={ 'Deceased Age' } message={ message.decAge }/> }
					{ stringHasValue( message.decGender ) && <FCMessageDetailItem title={ 'Deceased Gender' } message={ message.decGender }/> }
					{ stringHasValue( message.tod ) && <FCMessageDetailItem title={ 'Time of Death' } message={ message.tod }/> }
					{ stringHasValue( message.dod ) && <FCMessageDetailItem title={ 'Date of Death' } message={ message.dod }/> }
					{ stringHasValue( message.cod ) && <FCMessageDetailItem title={ 'Cause of Death' } message={ message.cod }/> }
					{ stringHasValue( message.dob ) && <FCMessageDetailItem title={ 'Date of Birth' } message={ message.dob }/> }
					{ stringHasValue( message.ssn ) && <FCMessageDetailItem title={ 'Social Security Number' } message={ message.ssn }/> }
					{ stringHasValue( message.weight ) && <FCMessageDetailItem title={ 'Weight' } message={ message.weight }/> }
					{ stringHasValue( message.height ) && <FCMessageDetailItem title={ 'Height' } message={ message.height }/> }
					{ stringHasValue( message.decHomeAddress ) && <FCMessageDetailItem title={ 'Deceased Home Address' } message={ message.decHomeAddress }/> }
					{ stringHasValue( message.decVeteran ) && <FCMessageDetailItem title={ 'Deceased Veteran' } message={ message.decVeteran }/> }
					{ stringHasValue( message.nok ) && <FCMessageDetailItem title={ 'Next of Kin' } message={ message.nok }/> }
					{ stringHasValue( message.nokPho ) && <FCMessageDetailItem title={ 'Next of Kin Phone' } message={ formatPhoneNumberOrNull( message.nokPho ) } link={ message.nokPho } onPress={ ( l ) => onLinkPress( l ) }/> }
					{ stringHasValue( message.numberType3 ) && <FCMessageDetailItem title={ 'Number Type 3' } message={ message.numberType3 }/> }
					{ stringHasValue( message.nokAltPho ) && <FCMessageDetailItem title={ 'Next of Kin Alt Phone' } message={ formatPhoneNumberOrNull( message.nokAltPho ) } link={ message.nokAltPho } onPress={ ( l ) => onLinkPress( l ) }/> }
					{ stringHasValue( message.nokAdd ) && <FCMessageDetailItem title={ 'Next of Kin Address' } message={ message.nokAdd }/> }
					{ stringHasValue( message.famWaiting ) && <FCMessageDetailItem title={ 'Family Waiting' } message={ message.famWaiting }/> }
					{ stringHasValue( message.readyForRelease ) && <FCMessageDetailItem title={ 'Ready For Release' } message={ message.readyForRelease }/> }
					{ stringHasValue( message.attorneyName ) && <FCMessageDetailItem title={ 'Attorney Name' } message={ message.attorneyName }/> }
					{ stringHasValue( message.bestTimeToContact ) && <FCMessageDetailItem title={ 'Best Time To Contact' } message={ message.bestTimeToContact }/> }
					{ stringHasValue( message.businessHours ) && <FCMessageDetailItem title={ 'Business Hours' } message={ message.businessHours }/> }
					{ stringHasValue( message.attPhy ) && <FCMessageDetailItem title={ 'Attending Physician' } message={ message.attPhy }/> }
					{ stringHasValue( message.certifyingPhysician ) && <FCMessageDetailItem title={ 'Certifying Physician' } message={ message.certifyingPhysician }/> }
					{ stringHasValue( message.claimFiled ) && <FCMessageDetailItem title={ 'Claim Filed' } message={ message.claimFiled }/> }
					{ stringHasValue( message.phyDC ) && <FCMessageDetailItem title={ 'Physician Signing Death Cert' } message={ message.phyDC }/> }
					{ stringHasValue( message.donorNumber ) && <FCMessageDetailItem title={ 'Donor Number' } message={ message.donorNumber }/> }
					{ stringHasValue( message.drNotified ) && <FCMessageDetailItem title={ 'Doctor Notified' } message={ message.drNotified }/> }
					{ stringHasValue( message.drPho ) && <FCMessageDetailItem title={ 'Doctor Phone' } message={ formatPhoneNumberOrNull( message.drPho ) } link={ message.drPho } onPress={ ( l ) => onLinkPress( l ) }/> }
					{ stringHasValue( message.drAdd ) && <FCMessageDetailItem title={ 'Doctor Address' } message={ message.drAdd }/> }
					{ stringHasValue( message.coronerName ) && <FCMessageDetailItem title={ 'Coroner Name' } message={ message.coronerName }/> }
					{ stringHasValue( message.coronerPhoneNumber ) && <FCMessageDetailItem title={ 'Coroner Phone Number' } message={ formatPhoneNumberOrNull( message.coronerPhoneNumber ) } link={ message.coronerPhoneNumber } onPress={ ( l ) => onLinkPress( l ) }/> }
					{ stringHasValue( message.coronerNotified ) && <FCMessageDetailItem title={ 'Coroner Notified' } message={ message.coronerNotified }/> }
					{ stringHasValue( message.njaNumber ) && <FCMessageDetailItem title={ 'NJA Number' } message={ message.njaNumber }/> }
					{ stringHasValue( message.autopsyRequested ) && <FCMessageDetailItem title={ 'Autopsy Requested' } message={ message.autopsyRequested }/> }
					{ stringHasValue( message.permissionToEmbalm ) && <FCMessageDetailItem title={ 'Permission To Embalm' } message={ message.permissionToEmbalm }/> }
					{ stringHasValue( message.deathCallBackTonight ) && <FCMessageDetailItem title={ 'Death Call Back Tonight' } message={ message.deathCallBackTonight }/> }
					{ stringHasValue( message.pronouncingPerson ) && <FCMessageDetailItem title={ 'Pronouncing Person' } message={ message.pronouncingPerson }/> }
					{ stringHasValue( message.pronouncementTime ) && <FCMessageDetailItem title={ 'Pronouncement Time' } message={ message.pronouncementTime }/> }
					{ stringHasValue( message.etaDataInfo ) && <FCMessageDetailItem title={ 'ETA Data Info' } message={ message.etaDataInfo }/> }
					{ stringHasValue( message.decOnHospiceCare ) && <FCMessageDetailItem title={ 'Deceased On Hospice Care' } message={ message.decOnHospiceCare }/> }
					{ stringHasValue( message.hospiceNotified ) && <FCMessageDetailItem title={ 'Hospice Notified' } message={ message.hospiceNotified }/> }
					{ stringHasValue( message.decRemainOvernightInMorgue ) && <FCMessageDetailItem title={ 'Deceased Remain Overnight In Morgue' } message={ message.decRemainOvernightInMorgue }/> }
					{ stringHasValue( message.bodyReleasedFromDonorServices ) && <FCMessageDetailItem title={ 'Body Released From Donor Services' } message={ message.bodyReleasedFromDonorServices }/> }
					{ stringHasValue( message.removalPersonnelNeeded ) && <FCMessageDetailItem title={ 'Removal Personnel Needed' } message={ message.removalPersonnelNeeded }/> }
					{ stringHasValue( message.stairsAtDeceasedLocation ) && <FCMessageDetailItem title={ 'Stairs At Deceased Location' } message={ message.stairsAtDeceasedLocation }/> }
					{ stringHasValue( message.countyDeathOccurredIn ) && <FCMessageDetailItem title={ 'County Death Occurred In' } message={ message.countyDeathOccurredIn }/> }
					{ stringHasValue( message.removalNoticeInformation ) && <FCMessageDetailItem title={ 'Removal Notice Information' } message={ message.removalNoticeInformation }/> }
					{ stringHasValue( message.callerID ) && <FCMessageDetailItem title={ 'Caller ID' } message={ formatPhoneNumberOrNull( message.callerID ) } link={ message.callerID } onPress={ ( l ) => onLinkPress( l ) }/> }
					{ stringHasValue( message.receptionistInitials ) && <FCMessageDetailItem title={ 'Receptionist Taking Call' } message={ message.receptionistInitials }/> }
					{ stringHasValue( message.openField1 ) && <FCMessageDetailItem message={ message.openField1 }/> }
					{ stringHasValue( message.openField2 ) && <FCMessageDetailItem message={ message.openField2 }/> }
					{ stringHasValue( message.openField3 ) && <FCMessageDetailItem message={ message.openField3 }/> }
					{ stringHasValue( message.openField4 ) && <FCMessageDetailItem message={ message.openField4 }/> }
					{ stringHasValue( message.openField5 ) && <FCMessageDetailItem message={ message.openField5 }/> }
					{ stringHasValue( message.openField6 ) && <FCMessageDetailItem message={ message.openField6 }/> }
					{ stringHasValue( message.openField7 ) && <FCMessageDetailItem message={ message.openField7 }/> }
					{ stringHasValue( message.openField8 ) && <FCMessageDetailItem message={ message.openField8 }/> }
					{ stringHasValue( message.openField9 ) && <FCMessageDetailItem message={ message.openField9 }/> }
					{ stringHasValue( message.openField10 ) && <FCMessageDetailItem message={ message.openField10 }/> }
					{ stringHasValue( message.confirmedBy ) && <FCMessageDetailItem title={ 'Confirmed By' } message={ message.confirmedBy }/> }
					{ stringHasValue( message.confirmedTime ) && <FCMessageDetailItem title={ 'Confirmed At' } message={ timeFormatterAlt( message.confirmedTime ) }/> }
					{ stringHasValue( message.messageResponseField ) && <FCMessageDetailItem title={ 'Message Sent to FuneralCall' } message={ message.messageResponseField }/> }

				</ScrollView>

					<View style={ { height: 60, marginStart: 15, marginEnd: 15, marginBottom: 10, justifyContent: 'center' } }>
						<Pressable style={ { height: 40, borderRadius: 5, alignItems: 'center', justifyContent: 'center', backgroundColor: PRIMARY_COLOR, width: isConfimed ? 150 : 125, flexDirection: 'row' } } onPress={ () => onConfirmPress() }>
							{ isConfimed && <Icon name="checkmark-circle-2" fill="#ffffff" style={ { height: iconSize, width: iconSize, marginRight: 5 } }/> }
							<FCLabel label={ isConfimed ? 'Confirmed' : 'Confirm' } labelStyle={ { fontSize: 20, fontFamily: 'OpenSans-Bold' } }/>
						</Pressable>
					</View>

					<FloatingMenu isOpen={ isMenuOpen }
								  items={ menuItems }
								  dimmerStyle={ { backgroundColor: TRANSPARENT_COLOR } }
								  renderMenuIcon={ renderMenuIcon }
								  renderItemIcon={ renderItemIcon }
								  onMenuToggle={ handleMenuToggle }
								  onItemPress={ handleItemPress }
								  primaryColor={ PRIMARY_COLOR }
								  backgroundUpColor={ PRIMARY_COLOR }
								  right={ 20 }
								  bottom={ 20 }
								  buttonWidth={ 45 }/>
				</>
			}

			<DialogInput visible={ modalVisible } message={ 'Are you sure you want to confirm this message?' } multiline={ true } placeholder={ 'Optional Response Message' } showCancelButton={ 'true' } onCancelPress={ () => onCancelDialogPress() } onOKPress={ ( text ) => onOKDialogPress( text ) }/>

			<DialogSaveContact visible={ dialogSaveContactVisible }
							   firstName={ message.callerFirstName ? message.callerFirstName : '' }
							   lastName={ message.callerLastName ? message.callerLastName : '' }
							   phone={ message.phone ? message.phone : '' }
							   altPhone={ message.altPhone ? message.altPhone : '' }
							   onCancelPress={ () => onCancelDialogSaveContactPress() }
							   onOKPress={ ( contact ) => onOKDialogSaveContactPress( contact ) } />

			<DialogOKCancel visible={ modalDeleteConfirmVisible } message={ 'Are you sure you want to delete this message?' } showCancelButton={ 'true' } onCancelPress={ () => onCancelDeleteMessageDialogPress() } onOKPress={ () => onOKDeleteMessageDialogPress() }/>

			<DialogContactList visible={ modalContactListVisible } onCancelPress={ () => onCancelContactListDialogPress() } onContactPress={ ( contact ) => onOKContactListDialogPress( contact ) } />

			<DialogCallPrompt visible={ modalCallPromptVisible }
							  cellPhone={ context.current.user.cell_phone_number }
							  officeNumber={ context.current.user.office_number }
							  onCellNumberPress={ () => onCellNumberPress() }
							  onOfficeNumberPress={ () => onOfficeNumberPress() }
							  onCancelPress={ () => onCallPromptCancelPress() }/>

		</SafeAreaView>
	);
}
