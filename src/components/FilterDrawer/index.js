import React from 'react';
import {
	Drawer,
	Box,
	Typography,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Button,
	IconButton,
	Stack,
	Divider
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

function FilterDrawer({
	open,
	onClose,
	filters,
	onStatusChange,
	onSortChange,
	onApply,
	statusOptions,
	sortOptions
}) {
	return (
		<Drawer
			anchor="right"
			open={open}
			onClose={onClose}
			PaperProps={{
				sx: { width: '80%', maxWidth: 360 }
			}}
		>
			<Box sx={{ p: 2 }}>
				<Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<Typography variant="h6">Filters</Typography>
					<IconButton onClick={onClose} size="small">
						<CloseIcon />
					</IconButton>
				</Box>

				<FormControl fullWidth sx={{ mb: 2 }}>
					<InputLabel>Status</InputLabel>
					<Select
						value={filters.status}
						onChange={onStatusChange}
						label="Status"
					>
						{statusOptions.map(option => (
							<MenuItem key={option.value} value={option.value}>
								{option.label}
							</MenuItem>
						))}
					</Select>
				</FormControl>

				<FormControl fullWidth sx={{ mb: 3 }}>
					<InputLabel>Sort By</InputLabel>
					<Select
						value={filters.sort}
						onChange={onSortChange}
						label="Sort By"
					>
						{sortOptions.map(option => (
							<MenuItem key={option.value} value={option.value}>
								{option.label}
							</MenuItem>
						))}
					</Select>
				</FormControl>
			</Box>

			<Box sx={{
				p: 2,
				borderTop: '1px solid',
				borderColor: 'divider',
				mt: 'auto'
			}}>
				<Stack direction="row" spacing={2}>
					<Button
						variant="outlined"
						fullWidth
						onClick={onClose}
					>
						Cancel
					</Button>
					<Button
						variant="contained"
						fullWidth
						onClick={onApply}
					>
						Apply Filters
					</Button>
				</Stack>
			</Box>
		</Drawer>
	);
}

export default FilterDrawer;
