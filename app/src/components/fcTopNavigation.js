import { Divider, Icon, TopNavigation, TopNavigationAction } from '@ui-kitten/components';
import { Image } from 'react-native';
import { DrawerActions } from '@react-navigation/native';
import React from 'react';

const FCTopNavigation = props =>
{
	const onRightAccessoryPress = () =>
	{
		if( props.onRightAccessoryPress )
		{
			props.onRightAccessoryPress();
		}
		else
		{
			props.navigation.dispatch( DrawerActions.toggleDrawer() );
		}
	};

	return (
		<>
			<TopNavigation title={ topNavigationProps => <Image { ...topNavigationProps } source={ require( '../assets/images/funeral-call-logo-alt.png' ) } style={ { height: 45, resizeMode: 'contain', marginBottom: 10 } }/> }
						   alignment="center"
						   accessoryLeft={ props.accessoryLeft }
						   accessoryRight={ () => ( <TopNavigationAction icon={ ( topNavigationActionProps ) => ( <Icon { ...topNavigationActionProps } name="menu-2"/> ) } onPress={ onRightAccessoryPress }/> ) }/>
			<Divider/>
		</>
	);
};

export default FCTopNavigation;
