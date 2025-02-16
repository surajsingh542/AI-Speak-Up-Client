import React, { useState, useEffect, useCallback } from 'react';
import {
	Box,
	Container,
	Typography,
	Accordion,
	AccordionSummary,
	AccordionDetails,
	Select,
	MenuItem,
	FormControl,
	InputLabel,
	CircularProgress,
	Alert,
	Paper,
	InputBase,
	IconButton,
	Divider,
	Chip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import axiosInstance from '../../config/axios';
import axios from 'axios';
import useDebounceSearch from '../../hooks/useDebounceSearch';

const FAQ = () => {
	const [faqs, setFaqs] = useState([]);
	const [category, setCategory] = useState('');
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [searchQuery, setSearchQuery] = useState('');
	const [expandedPanel, setExpandedPanel] = useState(false);
	const debouncedSearchQuery = useDebounceSearch(searchQuery);

	const categories = [
		{ value: '', label: 'All Categories' },
		{ value: 'general', label: 'General' },
		{ value: 'account', label: 'Account' },
		{ value: 'complaints', label: 'Complaints' },
		{ value: 'technical', label: 'Technical' },
		{ value: 'security', label: 'Security' }
	];

	const fetchFAQs = useCallback(async (abortController) => {
		try {
			setLoading(true);
			const url = category ? `/faqs?category=${category}` : '/faqs';
			const response = await axiosInstance.get(url, {
				signal: abortController.signal
			});
			setFaqs(response.data);
			setError(null);
		} catch (err) {
			if (!axios.isCancel(err)) {
				setError('Failed to load FAQs. Please try again later.');
				console.error('Error fetching FAQs:', err);
			}
		} finally {
			setLoading(false);
		}
	}, [category]);

	useEffect(() => {
		const abortController = new AbortController();
		fetchFAQs(abortController);

		return () => {
			abortController.abort();
		};
	}, [fetchFAQs]);

	const handleCategoryChange = (event) => {
		setCategory(event.target.value);
		setExpandedPanel(false);
	};

	const handleSearchChange = (event) => {
		setSearchQuery(event.target.value);
		setExpandedPanel(false);
	};

	const handleAccordionChange = (panel) => (event, isExpanded) => {
		setExpandedPanel(isExpanded ? panel : false);
	};

	const filteredFAQs = faqs.filter(faq => {
		const matchesSearch = !debouncedSearchQuery ||
			faq.question.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
			faq.answer.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
		return matchesSearch;
	});

	if (loading) {
		return (
			<Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
				<CircularProgress />
			</Box>
		);
	}

	return (
		<Container maxWidth="md" sx={{ py: 4 }}>
			<Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
				<Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
					Frequently Asked Questions
				</Typography>

				<Box sx={{ display: 'flex', gap: 2, mb: 4, flexDirection: { xs: 'column', sm: 'row' } }}>
					<Paper
						component="form"
						sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', flex: 1 }}
					>
						<InputBase
							sx={{ ml: 1, flex: 1 }}
							placeholder="Search FAQs"
							value={searchQuery}
							onChange={handleSearchChange}
						/>
						<IconButton type="button" sx={{ p: '10px' }} aria-label="search">
							<SearchIcon />
						</IconButton>
					</Paper>

					<FormControl sx={{ minWidth: 200 }}>
						<InputLabel id="category-select-label">Category</InputLabel>
						<Select
							labelId="category-select-label"
							id="category-select"
							value={category}
							label="Category"
							onChange={handleCategoryChange}
						>
							{categories.map((cat) => (
								<MenuItem key={cat.value} value={cat.value}>
									{cat.label}
								</MenuItem>
							))}
						</Select>
					</FormControl>
				</Box>

				{error && (
					<Alert severity="error" sx={{ mb: 3 }}>
						{error}
					</Alert>
				)}

				{filteredFAQs.length === 0 ? (
					<Typography variant="body1" align="center" color="text.secondary" sx={{ mt: 4 }}>
						No FAQs found matching your criteria.
					</Typography>
				) : (
					<Box sx={{ mt: 2 }}>
						{filteredFAQs.map((faq) => (
							<Accordion
								key={faq._id}
								expanded={expandedPanel === faq._id}
								onChange={handleAccordionChange(faq._id)}
								sx={{
									mb: 1,
									'&:before': { display: 'none' },
									boxShadow: 'none',
									border: '1px solid',
									borderColor: 'divider',
									'&:first-of-type': { borderTopLeftRadius: 8, borderTopRightRadius: 8 },
									'&:last-of-type': { borderBottomLeftRadius: 8, borderBottomRightRadius: 8 }
								}}
							>
								<AccordionSummary
									expandIcon={<ExpandMoreIcon />}
									aria-controls={`faq-${faq._id}-content`}
									id={`faq-${faq._id}-header`}
									sx={{
										'&.Mui-expanded': {
											minHeight: 48,
											bgcolor: 'action.selected'
										}
									}}
								>
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
										<Typography variant="subtitle1" sx={{ flex: 1 }}>
											{faq.question}
										</Typography>
										<Chip
											label={faq.category}
											size="small"
											sx={{
												bgcolor: 'primary.main',
												color: 'primary.contrastText'
											}}
										/>
									</Box>
								</AccordionSummary>
								<AccordionDetails sx={{ pt: 0, pb: 3, px: 3 }}>
									<Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
										{faq.answer}
									</Typography>
								</AccordionDetails>
							</Accordion>
						))}
					</Box>
				)}
			</Paper>
		</Container>
	);
};

export default FAQ; 