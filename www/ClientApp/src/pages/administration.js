import React, {useContext, useEffect, useRef} from "react";
import {
	AppBar, Box,
	CssBaseline,
	Divider,
	Drawer,
	Hidden,
	IconButton, List, ListItem, ListItemIcon, ListItemText,
	Toolbar
} from "@material-ui/core";
import MenuIcon from '@material-ui/icons/Menu';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import {makeStyles, useTheme} from '@material-ui/core/styles';
import Clients from "../components/clients/clients";
import Users from "../components/users/users";
import Obituaries from "../components/obituaries/obituaries";
import ButtonNeutral from "../components/buttonNeutral";
import {StateContext} from "../stateService";
import {withRouter} from "react-router-dom";
import ClientUsers from "../components/clients/clientUsers/clientUsers";

const Administration = props =>
{
	const drawerWidth = 240;

	const useStyles = makeStyles( ( theme ) => ( {
		root: {
			display: 'flex',
		},
		drawer: {
			[theme.breakpoints.up('sm')]: {
				width: drawerWidth,
				flexShrink: 0,
			},
		},
		appBar: {
			[theme.breakpoints.up('sm')]: {
				width: `calc(100% - ${drawerWidth}px)`,
				marginLeft: drawerWidth,
			},
			backgroundColor: '#424242'
		},
		menuButton: {
			marginRight: theme.spacing(2),
			[theme.breakpoints.up('sm')]: {
				display: 'none',
			},
		},
		toolbar: theme.mixins.toolbar,
		drawerPaper: {
			width: drawerWidth,
		},
		content: {
			flexGrow: 1,
			padding: theme.spacing(3),
		},
	}));

	const context           			= useRef( useContext( StateContext ) );
	const classes						= useStyles();
	const theme							= useTheme();
	const [mobileOpen, setMobileOpen]	= React.useState( false );
	const [menuItems, setMenuItems]		= React.useState( [] );
	const [activeItem, setActiveItem]	= React.useState( null );
	const handleDrawerToggle			= () => { setMobileOpen( !mobileOpen ); };
	const container						= window !== undefined ? () => window.document.body : undefined;

	useEffect( () =>
	{
		switch( context.current.access )
		{
			case 99:
			{
				setMenuItems( [ { 'name': 'Users', 'component': <Users />, 'icon': <InboxIcon /> }, { 'name': 'Clients', 'component': <Clients />, 'icon': <InboxIcon /> }, { 'name': 'Client Users', 'component': <ClientUsers />, 'icon': <InboxIcon /> }, { 'name': 'Obituaries', 'component': <Obituaries />, 'icon': <InboxIcon /> } ] );
				break;
			}
			case 2:
			{
				setMenuItems( [ { 'name': 'Clients', 'component': <Clients />, 'icon': <InboxIcon /> }, { 'name': 'Client Users', 'component': <ClientUsers />, 'icon': <InboxIcon /> }, { 'name': 'Obituaries', 'component': <Obituaries />, 'icon': <InboxIcon /> } ] );
				break;
			}
			case 1:
			{
				setMenuItems( [ { 'name': 'Obituaries', 'component': <Obituaries />, 'icon': <InboxIcon /> } ] );
				break;
			}
		}
		
	}, [] );

	const drawer = (
		<div>
			<div className={ classes.toolbar }/>
			<Divider/>
			<List>
				{ menuItems.map( ( item, index ) => (
					<ListItem button key={ item.name } onClick={ () => onMenuItemSelected( index ) } selected={ !!( activeItem && activeItem.name === item.name ) } >
						<ListItemIcon>{ item.icon }</ListItemIcon>
						<ListItemText primary={ item.name }/>
					</ListItem>
				) ) }
			</List>
		</div>
	);

	const onMenuItemSelected = ( index ) =>
	{
		setActiveItem( menuItems[index] );
	}
	
	const onLogout = () =>
    {
        context.current.update( 'token', null );
        
        props.history.push( "/" )
    };
	
	return (
		<div className={ classes.root }>
			<CssBaseline/>
			<AppBar position="fixed" className={ classes.appBar }>
				<Toolbar>
					<IconButton color="inherit" edge="start" onClick={ handleDrawerToggle } className={ classes.menuButton }>
						<MenuIcon/>
					</IconButton>
					<Box style={ { flexGrow: 1, lineHeight: 0 } }>
						<img src={ `${process.env.PUBLIC_URL}/images/funeral-call-logo.png` } height={ 64 } alt="" />
					</Box>
					<ButtonNeutral label="Logout" onClick={ onLogout } />
				</Toolbar>
			</AppBar>
			<nav className={classes.drawer} >
				<Hidden smUp implementation="css">
					<Drawer container={ container } variant="temporary" anchor={ theme.direction === 'rtl' ? 'right' : 'left' } open={ mobileOpen } onClose={ handleDrawerToggle } classes={ { paper: classes.drawerPaper } } ModalProps={ { keepMounted: true } }>
						{ drawer }
					</Drawer>
				</Hidden>
				<Hidden xsDown implementation="css">
					<Drawer classes={ { paper: classes.drawerPaper } } variant="permanent" open>
						{ drawer }
					</Drawer>
				</Hidden>
			</nav>
			<main className={ classes.content }>
				<div className={ classes.toolbar }/>
				{ activeItem && activeItem.component }
			</main>
		</div>
	);
}

export default withRouter( Administration );