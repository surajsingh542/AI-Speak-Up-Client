import React, { useState } from 'react';
import {
	Container,
	Typography,
	Box,
	Paper,
	Tab,
	Tabs
} from '@mui/material';
import Categories from './Categories';

function TabPanel(props) {
	const { children, value, index, ...other } = props;

	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`admin-tabpanel-${index}`}
			aria-labelledby={`admin-tab-${index}`}
			{...other}
		>
			{value === index && (
				<Box sx={{ py: 3 }}>
					{children}
				</Box>
			)}
		</div>
	);
}

function a11yProps(index) {
	return {
		id: `admin-tab-${index}`,
		'aria-controls': `admin-tabpanel-${index}`,
	};
}

function Admin() {
	const [tabValue, setTabValue] = useState(0);

	const handleTabChange = (event, newValue) => {
		setTabValue(newValue);
	};

	return (
		<Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
			<Typography variant="h4" component="h1" gutterBottom>
				Admin Dashboard
			</Typography>

			<Paper sx={{ width: '100%' }}>
				<Tabs
					value={tabValue}
					onChange={handleTabChange}
					aria-label="admin tabs"
					sx={{ borderBottom: 1, borderColor: 'divider' }}
				>
					<Tab label="Categories" {...a11yProps(0)} />
					<Tab label="Users" {...a11yProps(1)} />
					<Tab label="Reports" {...a11yProps(2)} />
				</Tabs>

				<TabPanel value={tabValue} index={0}>
					<Categories />
				</TabPanel>
				<TabPanel value={tabValue} index={1}>
					<Typography>Users management coming soon</Typography>
				</TabPanel>
				<TabPanel value={tabValue} index={2}>
					<Typography>Reports management coming soon</Typography>
				</TabPanel>
			</Paper>
		</Container>
	);
}

export default Admin; 