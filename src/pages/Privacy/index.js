import React from 'react';
import { Container, Box, Typography, Paper, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';

function Privacy() {
	const navigate = useNavigate();

	return (
		<Container maxWidth="md">
			<Box sx={{ mt: 4, mb: 8 }}>
				<Button
					startIcon={<ArrowBackIcon />}
					onClick={() => navigate(-1)}
					sx={{ mb: 3 }}
				>
					Back
				</Button>

				<Paper elevation={0} sx={{ p: 4, border: '1px solid', borderColor: 'divider' }}>
					<Typography variant="h4" component="h1" gutterBottom>
						Privacy Policy
					</Typography>

					<Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
						1. Information We Collect
					</Typography>
					<Typography paragraph>
						We collect information that you provide directly to us, including:
					</Typography>
					<ul>
						<Typography component="li" sx={{ ml: 3, mb: 1 }}>
							Personal information (name, email address, phone number)
						</Typography>
						<Typography component="li" sx={{ ml: 3, mb: 1 }}>
							Account credentials
						</Typography>
						<Typography component="li" sx={{ ml: 3, mb: 1 }}>
							Complaint details and related communications
						</Typography>
						<Typography component="li" sx={{ ml: 3, mb: 1 }}>
							Usage data and preferences
						</Typography>
					</ul>

					<Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
						2. How We Use Your Information
					</Typography>
					<Typography paragraph>
						We use the collected information for:
					</Typography>
					<ul>
						<Typography component="li" sx={{ ml: 3, mb: 1 }}>
							Providing and improving our services
						</Typography>
						<Typography component="li" sx={{ ml: 3, mb: 1 }}>
							Processing and managing complaints
						</Typography>
						<Typography component="li" sx={{ ml: 3, mb: 1 }}>
							Communicating with you about your account and complaints
						</Typography>
						<Typography component="li" sx={{ ml: 3, mb: 1 }}>
							Analyzing usage patterns and improving user experience
						</Typography>
					</ul>

					<Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
						3. Information Sharing
					</Typography>
					<Typography paragraph>
						We do not sell your personal information. We may share your information with:
					</Typography>
					<ul>
						<Typography component="li" sx={{ ml: 3, mb: 1 }}>
							Service providers who assist in our operations
						</Typography>
						<Typography component="li" sx={{ ml: 3, mb: 1 }}>
							Law enforcement when required by law
						</Typography>
						<Typography component="li" sx={{ ml: 3, mb: 1 }}>
							Other parties with your explicit consent
						</Typography>
					</ul>

					<Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
						4. Data Security
					</Typography>
					<Typography paragraph>
						We implement appropriate technical and organizational measures to protect
						your personal information against unauthorized access, alteration, disclosure,
						or destruction.
					</Typography>

					<Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
						5. Your Rights
					</Typography>
					<Typography paragraph>
						You have the right to:
					</Typography>
					<ul>
						<Typography component="li" sx={{ ml: 3, mb: 1 }}>
							Access your personal information
						</Typography>
						<Typography component="li" sx={{ ml: 3, mb: 1 }}>
							Correct inaccurate data
						</Typography>
						<Typography component="li" sx={{ ml: 3, mb: 1 }}>
							Request deletion of your data
						</Typography>
						<Typography component="li" sx={{ ml: 3, mb: 1 }}>
							Object to data processing
						</Typography>
						<Typography component="li" sx={{ ml: 3, mb: 1 }}>
							Request data portability
						</Typography>
					</ul>

					<Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
						6. Cookies and Tracking
					</Typography>
					<Typography paragraph>
						We use cookies and similar tracking technologies to collect usage information
						and maintain user sessions. You can control cookie preferences through your
						browser settings.
					</Typography>

					<Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
						7. Children's Privacy
					</Typography>
					<Typography paragraph>
						Our service is not intended for children under 13 years of age. We do not
						knowingly collect personal information from children under 13.
					</Typography>

					<Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
						8. Changes to Privacy Policy
					</Typography>
					<Typography paragraph>
						We may update this privacy policy from time to time. We will notify you of
						any changes by posting the new policy on this page and updating the "Last
						updated" date.
					</Typography>

					<Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
						9. Contact Us
					</Typography>
					<Typography paragraph>
						If you have any questions about this Privacy Policy, please contact us at:
						privacy@speakup.com
					</Typography>

					<Typography sx={{ mt: 4 }} color="text.secondary">
						Last updated: {new Date().toLocaleDateString()}
					</Typography>
				</Paper>
			</Box>
		</Container>
	);
}

export default Privacy; 