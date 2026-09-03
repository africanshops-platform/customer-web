import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Button, CircularProgress } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ChecklistOutlinedIcon from '@mui/icons-material/ChecklistOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { setSessionRedirectUrl } from '@fuse/core/FuseAuthorization/sessionRedirectUrl';
import { selectUser } from 'src/app/auth/user/store/userSlice';
import { useMyApplications } from 'src/app/aaqueryhooks/careersQueries';
import { ORANGE_GRADIENT, STATUS_META, fadeUp } from './careersTheme';

function SignInPrompt() {
	const navigate = useNavigate();

	function goSignIn() {
		setSessionRedirectUrl('/careers/my-applications');
		navigate('/sign-in');
	}

	return (
		<div className="max-w-md mx-auto bg-white border border-orange-100 rounded-2xl shadow-sm p-8 text-center">
			<div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center mx-auto mb-4">
				<LockOutlinedIcon className="text-orange-600" />
			</div>
			<h3 className="font-bold text-gray-900 mb-2">Sign in to see your applications</h3>
			<p className="text-[14px] text-gray-500 mb-5">Track the status of every role you&apos;ve applied to.</p>
			<Button
				fullWidth
				variant="contained"
				onClick={goSignIn}
				sx={{ background: ORANGE_GRADIENT, color: 'white', fontWeight: 700, py: 1.1, textTransform: 'none' }}
			>
				Sign in
			</Button>
		</div>
	);
}

function EmptyState() {
	return (
		<div className="max-w-md mx-auto text-center py-16">
			<ChecklistOutlinedIcon
				className="text-orange-600 mb-3"
				fontSize="large"
			/>
			<h3 className="font-bold text-gray-900 mb-2">No applications yet</h3>
			<p className="text-[14px] text-gray-500">
				Browse{' '}
				<Link
					to="/careers"
					className="text-orange-600 font-semibold no-underline"
				>
					open roles
				</Link>{' '}
				and apply — your applications will show up here.
			</p>
		</div>
	);
}

function ApplicationRow({ application, index }) {
	const statusMeta = STATUS_META[application.status] || STATUS_META.SUBMITTED;

	return (
		<motion.div {...fadeUp(0.05 * index)}>
			<Link
				to={`/careers/${application.positionId}`}
				className="flex items-center justify-between gap-4 no-underline bg-white border border-orange-100 rounded-xl px-6 py-4 hover:shadow-md transition-shadow"
				style={{ textDecoration: 'none' }}
			>
				<div className="min-w-0">
					<p className="font-semibold text-gray-900 truncate">{application.position?.title || 'Position'}</p>
					<p className="text-[12px] text-gray-400">
						Applied{' '}
						{new Date(application.createdAt).toLocaleDateString('en-US', {
							year: 'numeric',
							month: 'short',
							day: 'numeric'
						})}
					</p>
				</div>
				<span className={`shrink-0 text-[12px] font-bold px-3 py-1 rounded-full ${statusMeta.className}`}>
					{statusMeta.label}
				</span>
			</Link>
		</motion.div>
	);
}

function MyApplicationsPage() {
	const user = useSelector(selectUser);
	const isAuthenticated = Boolean(user?.role && user.role.length > 0);
	const { data, isLoading } = useMyApplications(isAuthenticated);
	const applications = data?.data?.applications ?? [];

	return (
		<div className="flex flex-col w-full">
			<div
				className="py-16 md:py-20 px-6 md:px-16"
				style={{ background: ORANGE_GRADIENT }}
			>
				<div className="max-w-5xl mx-auto">
					<Link
						to="/careers"
						className="inline-flex items-center gap-1.5 no-underline text-white/85 text-[14px] font-medium mb-5"
					>
						<ArrowBackIcon fontSize="small" /> Browse open roles
					</Link>
					<motion.h1
						{...fadeUp(0)}
						className="text-[24px] md:text-[36px] font-extrabold text-white mb-2"
					>
						My Applications
					</motion.h1>
					<motion.p
						{...fadeUp(0.06)}
						className="text-white/90"
					>
						Track the status of every role you&apos;ve applied to.
					</motion.p>
				</div>
			</div>

			<div className="max-w-3xl w-full mx-auto px-6 md:px-16 py-12">
				{!isAuthenticated && <SignInPrompt />}
				{isAuthenticated && isLoading && (
					<div className="flex justify-center py-16">
						<CircularProgress sx={{ color: '#ea580c' }} />
					</div>
				)}
				{isAuthenticated && !isLoading && applications.length === 0 && <EmptyState />}
				{isAuthenticated && !isLoading && applications.length > 0 && (
					<div className="flex flex-col gap-3">
						{applications.map((application, index) => (
							<ApplicationRow
								key={application.id}
								application={application}
								index={index}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

export default MyApplicationsPage;
