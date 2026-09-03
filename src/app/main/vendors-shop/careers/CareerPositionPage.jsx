import { useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { CircularProgress, TextField, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import { setSessionRedirectUrl } from '@fuse/core/FuseAuthorization/sessionRedirectUrl';
import { selectUser } from 'src/app/auth/user/store/userSlice';
import { useApplyToPosition, useMyApplications, usePosition } from 'src/app/aaqueryhooks/careersQueries';
import SimpleMarkdown from './SimpleMarkdown';
import { ORANGE_GRADIENT, STATUS_META, fadeUp } from './careersTheme';

function ApplyPanel({ position }) {
	const navigate = useNavigate();
	const user = useSelector(selectUser);
	const isAuthenticated = Boolean(user?.role && user.role.length > 0);
	const { data: myAppsRes } = useMyApplications(isAuthenticated);
	const applyMutation = useApplyToPosition();
	const [coverNote, setCoverNote] = useState('');

	const existingApplication = useMemo(() => {
		const applications = myAppsRes?.data?.applications ?? [];
		return applications.find((app) => app.positionId === position.id);
	}, [myAppsRes, position.id]);

	function goSignIn() {
		setSessionRedirectUrl(window.location.pathname);
		navigate('/sign-in');
	}

	if (!isAuthenticated) {
		return (
			<div className="bg-white border border-orange-100 rounded-2xl shadow-sm p-6">
				<div className="flex items-center gap-3 mb-2">
					<div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center">
						<LockOutlinedIcon className="text-orange-600" fontSize="small" />
					</div>
					<h3 className="font-bold text-gray-900">Sign in to apply</h3>
				</div>
				<p className="text-[14px] text-gray-500 mb-5">
					Sign in with your AfricanShops account to apply for {position.title}.
				</p>
				<Button
					fullWidth
					variant="contained"
					onClick={goSignIn}
					sx={{
						background: ORANGE_GRADIENT,
						color: 'white',
						fontWeight: 700,
						py: 1.2,
						textTransform: 'none',
						'&:hover': { opacity: 0.92 }
					}}
				>
					Sign in
				</Button>
				<p className="text-[12px] text-gray-400 mt-4">
					Don&apos;t have an account?{' '}
					<Link
						to="/sign-up"
						className="text-orange-600 font-semibold no-underline"
					>
						Sign up
					</Link>{' '}
					first, then come back here to apply.
				</p>
			</div>
		);
	}

	if (existingApplication) {
		const statusMeta = STATUS_META[existingApplication.status] || STATUS_META.SUBMITTED;
		return (
			<div className="bg-white border border-orange-100 rounded-2xl shadow-sm p-6 text-center">
				<CheckCircleIcon
					className="text-green-600 mb-2"
					fontSize="large"
				/>
				<h3 className="font-bold text-gray-900 mb-2">You&apos;ve already applied</h3>
				<span className={`inline-block text-[12px] font-bold px-3 py-1 rounded-full ${statusMeta.className}`}>
					{statusMeta.label}
				</span>
				<p className="text-[14px] text-gray-500 mt-4">
					Track it under{' '}
					<Link
						to="/careers/my-applications"
						className="text-orange-600 font-semibold no-underline"
					>
						My Applications
					</Link>
					.
				</p>
			</div>
		);
	}

	return (
		<div className="bg-white border border-orange-100 rounded-2xl shadow-sm p-6">
			<h3 className="font-bold text-gray-900 mb-1">Apply for {position.title}</h3>
			<p className="text-[14px] text-gray-500 mb-4">A quick note on why you&apos;re a fit (optional, but it helps).</p>
			<TextField
				fullWidth
				multiline
				minRows={4}
				placeholder="Tell us why you're excited about this role…"
				value={coverNote}
				onChange={(e) => setCoverNote(e.target.value)}
				className="mb-4"
			/>
			<Button
				fullWidth
				variant="contained"
				disabled={applyMutation.isLoading}
				onClick={() => applyMutation.mutate({ id: position.id, coverNote: coverNote.trim() || undefined })}
				sx={{
					background: ORANGE_GRADIENT,
					color: 'white',
					fontWeight: 700,
					py: 1.2,
					textTransform: 'none',
					'&:hover': { opacity: 0.92 }
				}}
			>
				{applyMutation.isLoading ? 'Submitting…' : 'Submit application'}
			</Button>
		</div>
	);
}

function NotFoundState() {
	return (
		<div className="max-w-lg mx-auto text-center py-24">
			<WorkOutlineIcon
				className="text-orange-600 mb-4"
				fontSize="large"
			/>
			<h2 className="text-[24px] font-bold text-gray-900 mb-2">This role isn&apos;t open anymore</h2>
			<p className="text-gray-500 mb-6">It may have been filled or closed. Take a look at what&apos;s currently open.</p>
			<Button
				component={Link}
				to="/careers"
				variant="contained"
				startIcon={<ArrowBackIcon />}
				sx={{ background: ORANGE_GRADIENT, color: 'white', fontWeight: 700 }}
			>
				Browse open roles
			</Button>
		</div>
	);
}

function CareerPositionPage() {
	const { id } = useParams();
	const { data, isLoading, isError } = usePosition(id);
	const position = data?.data?.position;

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-32">
				<CircularProgress sx={{ color: '#ea580c' }} />
			</div>
		);
	}

	if (isError || !position) return <NotFoundState />;

	return (
		<div className="flex flex-col w-full">
			<div
				className="relative py-16 md:py-20 px-6 md:px-16 overflow-hidden"
				style={{ background: ORANGE_GRADIENT }}
			>
				<div className="max-w-5xl mx-auto relative z-10">
					<motion.div {...fadeUp(0)}>
						<Link
							to="/careers"
							className="inline-flex items-center gap-1.5 no-underline text-white/85 text-[14px] font-medium mb-5"
						>
							<ArrowBackIcon fontSize="small" /> Back to open roles
						</Link>
					</motion.div>
					<motion.span
						{...fadeUp(0.05)}
						className="inline-block bg-white/20 backdrop-blur-sm text-white text-[12px] font-bold px-4 py-1.5 rounded-full mb-4"
					>
						{position.departmentName || 'AfricanShops'}
						{position.designationName ? ` · ${position.designationName}` : ''}
					</motion.span>
					<motion.h1
						{...fadeUp(0.1)}
						className="text-[24px] md:text-[36px] font-extrabold text-white leading-tight mb-3"
					>
						{position.title}
					</motion.h1>
					<motion.div
						{...fadeUp(0.15)}
						className="inline-flex items-center gap-1.5 text-white/85 text-[14px]"
					>
						<LocationOnOutlinedIcon fontSize="small" />
						{position.location || 'Remote / Flexible'}
					</motion.div>
				</div>
			</div>

			<div className="max-w-7xl w-full mx-auto px-6 md:px-16 py-12 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-10 items-start">
				<motion.div
					{...fadeUp(0.12)}
					className="bg-white border border-orange-100 rounded-2xl shadow-sm p-6 md:p-10 min-w-0"
				>
					<p className="text-gray-700 leading-relaxed mb-4">{position.summary}</p>
					<SimpleMarkdown content={position.description} />

					{position.requirements?.length > 0 && (
						<>
							<h2 className="text-[20px] font-bold text-gray-900 mt-8 mb-3">What we&apos;re looking for</h2>
							<ul className="list-disc pl-5 space-y-1.5">
								{position.requirements.map((req) => (
									<li
										key={req}
										className="text-gray-700 leading-relaxed"
									>
										{req}
									</li>
								))}
							</ul>
						</>
					)}
				</motion.div>

				<motion.div {...fadeUp(0.2)}>
					<ApplyPanel position={position} />
				</motion.div>
			</div>
		</div>
	);
}

export default CareerPositionPage;
