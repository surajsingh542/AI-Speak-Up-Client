import React, { useState } from 'react';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	TextField,
	Box,
	Typography
} from '@mui/material';

function ComplaintStatusDialog({ open, onClose, complaint, onUpdateStatus }) {
	const [status, setStatus] = useState(complaint?.status || 'pending');
	const [resolution, setResolution] = useState('');

	const handleSubmit = () => {
		onUpdateStatus({
			status,
			resolution: resolution.trim()
		});
		onClose();
	};

	return (
		<Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
			<DialogTitle>Update Complaint Status</DialogTitle>
			<DialogContent>
				<Box sx={{ mb: 3 }}>
					<Typography variant="subtitle2" color="text.secondary" gutterBottom>
						Complaint ID: {complaint?._id}
					</Typography>
					<Typography variant="body1" gutterBottom>
						{complaint?.title}
					</Typography>
				</Box>

				<FormControl fullWidth sx={{ mb: 3 }}>
					<InputLabel>Status</InputLabel>
					<Select
						value={status}
						label="Status"
						onChange={(e) => setStatus(e.target.value)}
					>
						<MenuItem value="pending">Pending</MenuItem>
						<MenuItem value="in-progress">In Progress</MenuItem>
						<MenuItem value="resolved">Resolved</MenuItem>
						<MenuItem value="rejected">Rejected</MenuItem>
					</Select>
				</FormControl>

				<TextField
					fullWidth
					label="Resolution Note"
					multiline
					rows={4}
					value={resolution}
					onChange={(e) => setResolution(e.target.value)}
					placeholder="Add a note about the status update..."
				/>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>Cancel</Button>
				<Button 
					onClick={handleSubmit} 
					variant="contained"
					disabled={!status || (status !== 'pending' && !resolution.trim())}
				>
					Update Status
				</Button>
			</DialogActions>
		</Dialog>
	);
}

export default ComplaintStatusDialog; 