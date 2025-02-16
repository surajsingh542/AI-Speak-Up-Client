import React from 'react';
import { Container, Box, Typography, Paper, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';

function Terms() {
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
						Terms of Service
					</Typography>

					<Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
						1. Acceptance of Terms
					</Typography>
					<Typography paragraph>
						By accessing and using Speak Up, you agree to be bound by these Terms of Service.
						If you do not agree to these terms, please do not use our service.
					</Typography>

					<Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
						2. Description of Service
					</Typography>
					<Typography paragraph>
						Speak Up is a complaint management system that allows users to submit, track,
						and manage complaints. The service includes AI-powered categorization and
						response generation features.
					</Typography>

					<Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
						3. User Responsibilities
					</Typography>
					<Typography paragraph>
						Users are responsible for:
					</Typography>
					<ul>
						<Typography component="li" sx={{ ml: 3, mb: 1 }}>
							Providing accurate and truthful information
						</Typography>
						<Typography component="li" sx={{ ml: 3, mb: 1 }}>
							Maintaining the confidentiality of their account credentials
						</Typography>
						<Typography component="li" sx={{ ml: 3, mb: 1 }}>
							Using the service in compliance with applicable laws and regulations
						</Typography>
						<Typography component="li" sx={{ ml: 3, mb: 1 }}>
							Not engaging in any abusive or harmful behavior
						</Typography>
					</ul>

					<Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
						4. Privacy and Data Protection
					</Typography>
					<Typography paragraph>
						We collect and process personal data in accordance with our Privacy Policy.
						By using our service, you consent to such processing and warrant that all
						data provided by you is accurate.
					</Typography>

					<Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
						5. Intellectual Property
					</Typography>
					<Typography paragraph>
						All content and materials available on Speak Up, including but not limited to
						text, graphics, logos, button icons, images, audio clips, data compilations,
						and software, are the property of Speak Up or its content suppliers and
						protected by copyright laws.
					</Typography>

					<Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
						6. Limitation of Liability
					</Typography>
					<Typography paragraph>
						Speak Up and its affiliates shall not be liable for any indirect, incidental,
						special, consequential, or punitive damages, including without limitation,
						loss of profits, data, use, goodwill, or other intangible losses.
					</Typography>

					<Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
						7. Changes to Terms
					</Typography>
					<Typography paragraph>
						We reserve the right to modify these terms at any time. We will notify users
						of any material changes via email or through the service. Continued use of
						the service after such modifications constitutes acceptance of the updated terms.
					</Typography>

					<Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
						8. Termination
					</Typography>
					<Typography paragraph>
						We reserve the right to terminate or suspend access to our service immediately,
						without prior notice or liability, for any reason whatsoever, including without
						limitation if you breach the Terms.
					</Typography>

					<Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
						9. Contact Information
					</Typography>
					<Typography paragraph>
						For any questions about these Terms, please contact us at support@speakup.com
					</Typography>

					<Typography sx={{ mt: 4 }} color="text.secondary">
						Last updated: {new Date().toLocaleDateString()}
					</Typography>
				</Paper>
			</Box>
		</Container>
	);
}

export default Terms; 