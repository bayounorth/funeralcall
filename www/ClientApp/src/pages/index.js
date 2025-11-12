import React from "react";
import {makeStyles} from '@material-ui/core/styles';
import {Box, Container, CssBaseline, Grid, Link, Paper, Typography} from "@material-ui/core";
import {Copyright} from "../constants";
import { ContactPhoneOutlined, DateRangeOutlined, PhoneCallbackOutlined, RecordVoiceOverOutlined } from "@material-ui/icons";
import {useViewport} from "../viewportService";

export default function Index()
{
	const isMobile	= useViewport().width < 640;
    const useStyles = makeStyles( ( theme ) => ( {
		root: {
			marginTop:		theme.spacing( 4 ),
			display:		'flex',
			flexDirection:	'column',
			alignItems:		'center'
		},
		paper: {
			padding:		30,
			width:			250,
			height:			200,
			display:		'flex',
			flexDirection:	'column',
			alignItems:		'center',
			textAlign:		'center'
		}
	} ) );
    
    const classes = useStyles();
	
    return (
		<Container component="main" maxWidth="sm">
			<CssBaseline/>
			<div className={ classes.root }>
				<Box sm={ 4 } md={ 7 }>
					<img src={ `${process.env.PUBLIC_URL}/images/funeral-call-logo.png` } height={ 150 } alt="" />
				</Box>
				<Grid container spacing={ 2 } direction={ isMobile ? "column" : "row" } style={ { justifyContent: 'center', alignItems: 'center' } }>
					<Grid item xs>
						<Link underline='none' href={ `${process.env.PUBLIC_URL}/login` }>
							<Paper className={ classes.paper }>
								<DateRangeOutlined style={ { color: '#1daccc', fontSize: 72 } }/>
								<Typography component="h1" variant="h5">Service Arrangements</Typography>
							</Paper>
						</Link>
					</Grid>
					<Grid item xs>
						<Link underline='none' href='http://is.omnicall.com/ISWeb-FC' target="_blank">
							<Paper className={ classes.paper }>
								<RecordVoiceOverOutlined style={ { color: '#1daccc', fontSize: 72 } }/>
								<Typography component="h1" variant="h5">On Call Personnel</Typography>
							</Paper>
						</Link>
					</Grid>
				</Grid>
				<Grid container spacing={ 2 } direction={ isMobile ? "column" : "row" } style={ { justifyContent: 'center', alignItems: 'center', marginTop: isMobile ? 10 : 32 } }>
					<Grid item xs>
						<Link underline='none' href='http://is.omnicall.com/ISWeb-FC' target="_blank">
							<Paper className={ classes.paper }>
								<PhoneCallbackOutlined style={ { color: '#1daccc', fontSize: 72 } }/>
								<Typography component="h1" variant="h5">Messages / Call Monitoring</Typography>
							</Paper>
						</Link>
					</Grid>
					<Grid item xs>
						<Link underline='none' href='https://www.funeralcall.com/contact' target="_blank">
							<Paper className={ classes.paper }>
								<ContactPhoneOutlined style={ { color: '#1daccc', fontSize: 72 } }/>
								<Typography component="h1" variant="h5">Contact Us</Typography>
							</Paper>
						</Link>
					</Grid>
				</Grid>
			</div>
			<Box mt={ 8 }>
				<Copyright/>
			</Box>
		</Container>
	);
}