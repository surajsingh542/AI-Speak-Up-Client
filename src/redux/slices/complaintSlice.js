import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../config/axios';

// Async thunks
export const fetchComplaints = createAsyncThunk(
	'complaints/fetchComplaints',
	async ({ page = 1, limit = 10, filters = {}, signal }, { rejectWithValue }) => {
		try {
			const queryParams = new URLSearchParams({
				page,
				limit,
				...(filters.search && { search: filters.search }),
				...(filters.status && filters.status !== 'all' && { status: filters.status }),
				...(filters.priority && { priority: filters.priority }),
				...(filters.sort && { sort: filters.sort })
			}).toString();

			const response = await axios.get(`/complaints?${queryParams}`, { signal });
			return response.data;
		} catch (error) {
			if (error.name === 'AbortError') {
				throw error;
			}
			return rejectWithValue(error.response?.data?.message || 'Failed to fetch complaints');
		}
	}
);

export const fetchComplaintDetails = createAsyncThunk(
	'complaints/fetchComplaintDetails',
	async (id, { rejectWithValue }) => {
		try {
			const response = await axios.get(`/complaints/${id}`);
			return response.data;
		} catch (error) {
			return rejectWithValue(error.response?.data?.message || 'Failed to fetch complaint details');
		}
	}
);

export const createComplaint = createAsyncThunk(
	'complaints/createComplaint',
	async (complaintData, { rejectWithValue }) => {
		try {
			const response = await axios.post('/complaints', complaintData, {
				headers: {
					'Content-Type': 'multipart/form-data'
				}
			});
			return response.data;
		} catch (error) {
			return rejectWithValue(error.response?.data?.message || 'Failed to create complaint');
		}
	}
);

export const updateComplaint = createAsyncThunk(
	'complaints/updateComplaint',
	async ({ id, complaintData }, { rejectWithValue }) => {
		try {
			const response = await axios.put(`/complaints/${id}`, complaintData);
			return response.data;
		} catch (error) {
			return rejectWithValue(error.response?.data?.message || 'Failed to update complaint');
		}
	}
);

export const deleteComplaint = createAsyncThunk(
	'complaints/deleteComplaint',
	async (complaintId, { rejectWithValue }) => {
		try {
			await axios.delete(`/complaints/${complaintId}`);
			return complaintId;
		} catch (error) {
			return rejectWithValue(error.response?.data?.message || 'Failed to delete complaint');
		}
	}
);

export const addComment = createAsyncThunk(
	'complaints/addComment',
	async ({ complaintId, text }, { rejectWithValue }) => {
		try {
			const response = await axios.post(`/complaints/${complaintId}/comments`, { text });
			return response.data;
		} catch (error) {
			return rejectWithValue(error.response?.data?.message || 'Failed to add comment');
		}
	}
);

export const updateComplaintStatus = createAsyncThunk(
	'complaints/updateStatus',
	async ({ complaintId, status, resolution }, { rejectWithValue }) => {
		try {
			const response = await axios.patch(`/complaints/${complaintId}/status`, {
				status,
				resolution
			});
			return response.data;
		} catch (error) {
			return rejectWithValue(error.response?.data?.message || 'Failed to update status');
		}
	}
);

const initialState = {
	complaints: [],
	complaint: null,
	loading: false,
	error: null,
	totalComplaints: 0,
	currentPage: 1,
	totalPages: 1,
	filters: {
		status: 'all',
		priority: '',
		sort: 'newest',
		search: ''
	}
};

const complaintSlice = createSlice({
	name: 'complaints',
	initialState,
	reducers: {
		clearError: (state) => {
			state.error = null;
		},
		setFilters: (state, action) => {
			state.filters = {
				...state.filters,
				...action.payload
			};
			// Reset to page 1 when filters change
			if (!action.payload.currentPage) {
				state.currentPage = 1;
			}
		},
		resetFilters: (state) => {
			state.filters = initialState.filters;
			state.currentPage = 1;
		}
	},
	extraReducers: (builder) => {
		builder
			// Fetch Complaints
			.addCase(fetchComplaints.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchComplaints.fulfilled, (state, action) => {
				state.loading = false;
				state.complaints = action.payload.complaints;
				state.totalComplaints = action.payload.totalComplaints;
				state.currentPage = action.payload.currentPage;
				state.totalPages = action.payload.totalPages;
			})
			.addCase(fetchComplaints.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
				state.complaints = [];
				state.totalComplaints = 0;
				state.totalPages = 1;
			})
			// Fetch Complaint Details
			.addCase(fetchComplaintDetails.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchComplaintDetails.fulfilled, (state, action) => {
				state.loading = false;
				state.complaint = action.payload;
			})
			.addCase(fetchComplaintDetails.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Create Complaint
			.addCase(createComplaint.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(createComplaint.fulfilled, (state, action) => {
				state.loading = false;
				state.complaints.unshift(action.payload);
				state.totalComplaints += 1;
			})
			.addCase(createComplaint.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Update Complaint
			.addCase(updateComplaint.fulfilled, (state, action) => {
				const index = state.complaints.findIndex(c => c._id === action.payload._id);
				if (index !== -1) {
					state.complaints[index] = action.payload;
				}
				if (state.complaint?._id === action.payload._id) {
					state.complaint = action.payload;
				}
			})
			// Delete Complaint
			.addCase(deleteComplaint.pending, (state) => {
				state.loading = true;
			})
			.addCase(deleteComplaint.fulfilled, (state, action) => {
				state.loading = false;
				state.complaints = state.complaints.filter(complaint => complaint._id !== action.payload);
				state.totalComplaints = state.totalComplaints - 1;
				if (state.complaints.length === 0 && state.currentPage > 1) {
					state.currentPage -= 1;
				}
			})
			.addCase(deleteComplaint.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			// Add Comment
			.addCase(addComment.fulfilled, (state, action) => {
				if (state.complaint?._id === action.payload.complaintId) {
					state.complaint.comments.push(action.payload);
				}
			})
			// Update Status
			.addCase(updateComplaintStatus.fulfilled, (state, action) => {
				const index = state.complaints.findIndex(c => c._id === action.payload._id);
				if (index !== -1) {
					state.complaints[index] = action.payload;
				}
				if (state.complaint?._id === action.payload._id) {
					state.complaint = action.payload;
				}
			});
	}
});

export const { clearError, setFilters, resetFilters } = complaintSlice.actions;
export default complaintSlice.reducer; 