import { motion } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import Pagination from '@mui/material/Pagination';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PublicIcon from '@mui/icons-material/Public';
import GroupsIcon from '@mui/icons-material/Groups';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import { useOpenPositions } from 'src/app/aaqueryhooks/careersQueries';
import { ORANGE_GRADIENT, fadeUp } from './careersTheme';

const PERKS = [
	{
		icon: PublicIcon,
		title: 'Real, continent-scale impact',
		body: 'Every role here touches a platform already moving goods, money, and services across Africa — your work ships to millions, not a staging environment.'
	},
	{
		icon: TrendingUpIcon,
		title: 'Room to grow fast',
		body: 'A young, fast-moving platform with new verticals launching regularly — the scope of what you own grows as the company does.'
	},
	{
		icon: GroupsIcon,
		title: 'Small teams, real ownership',
		body: 'Lean teams by design — you’ll own outcomes end-to-end, not a narrow slice of a much bigger machine.'
	},
	{
		icon: RocketLaunchIcon,
		title: 'Build for the long run',
		body: 'AfricanShops is being built as durable infrastructure for African commerce and community — work that’s meant to matter for decades, not one funding cycle.'
	}
];

function LoadingGrid() {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
			{[0, 1, 2].map((i) => (
				<div
					key={i}
					className="h-44 rounded-2xl bg-white border border-orange-100 animate-pulse"
				/>
			))}
		</div>
	);
}

function EmptyState() {
	return (
		<div className="max-w-lg mx-auto text-center py-16">
			<div className="w-16 h-16 rounded-2xl bg-white border border-orange-100 shadow-sm flex items-center justify-center mx-auto mb-6">
				<WorkOutlineIcon
					className="text-orange-600"
					fontSize="large"
				/>
			</div>
			<h2 className="text-[24px] font-bold text-gray-900 mb-2">No open roles right now</h2>
			<p className="text-gray-500">We&apos;re not hiring for a specific position at the moment — check back soon.</p>
		</div>
	);
}

function PositionCard({ position, index }) {
	return (
		<motion.div {...fadeUp(0.06 * index)}>
			<Link
				to={`/careers/${position.id}`}
				className="block h-full no-underline bg-white border border-orange-100 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 p-6"
				style={{ textDecoration: 'none' }}
			>
				<span className="inline-block bg-orange-50 text-orange-700 text-[12px] font-bold tracking-wide px-3 py-1 rounded-full mb-3">
					{position.departmentName || 'AfricanShops'}
				</span>
				<h3 className="text-[18px] font-bold text-gray-900 mb-2 leading-snug">{position.title}</h3>
				<p className="text-[14px] text-gray-500 mb-6 line-clamp-3">{position.summary}</p>
				<div className="flex items-center justify-between pt-4 border-t border-orange-50">
					<span className="inline-flex items-center gap-1 text-[12px] text-gray-400">
						<LocationOnOutlinedIcon fontSize="inherit" />
						{position.location || 'Remote / Flexible'}
					</span>
					<span className="inline-flex items-center gap-1 text-[12px] font-bold text-orange-600">
						View role <ArrowForwardIcon fontSize="inherit" />
					</span>
				</div>
			</Link>
		</motion.div>
	);
}

function PerksSection() {
	return (
		<div className="bg-white border-t border-orange-50">
			<div className="max-w-7xl w-full mx-auto px-6 md:px-16 py-16 md:py-20">
				<motion.div
					{...fadeUp(0)}
					className="max-w-2xl mb-12"
				>
					<span className="inline-block text-orange-600 text-[12px] font-bold tracking-wide mb-3">WHY AFRICANSHOPS</span>
					<h2 className="text-[24px] md:text-[30px] font-extrabold text-gray-900 mb-3">Work that compounds</h2>
					<p className="text-gray-500">
						We&apos;re building the commercial and civic backbone for African communities — from local
						marketplaces to logistics to community ownership. Here&apos;s what that means day to day.
					</p>
				</motion.div>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
					{PERKS.map((perk, index) => {
						const Icon = perk.icon;
						return (
							<motion.div
								key={perk.title}
								{...fadeUp(0.06 * index)}
								className="p-6 rounded-2xl border border-orange-50 hover:border-orange-100 hover:shadow-sm transition-all duration-300"
							>
								<div
									className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
									style={{ background: ORANGE_GRADIENT }}
								>
									<Icon
										className="text-white"
										fontSize="small"
									/>
								</div>
								<h3 className="font-bold text-gray-900 mb-2 leading-snug">{perk.title}</h3>
								<p className="text-[14px] text-gray-500 leading-relaxed">{perk.body}</p>
							</motion.div>
						);
					})}
				</div>
			</div>
		</div>
	);
}

function CareersListPage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const page = Math.max(parseInt(searchParams.get('page'), 10) || 1, 1);

	const { data, isLoading } = useOpenPositions(page);
	const positions = data?.data?.positions ?? [];
	const total = data?.data?.total ?? 0;
	const limit = data?.data?.limit ?? 12;
	const pageCount = Math.max(Math.ceil(total / limit), 1);

	function handlePageChange(_e, value) {
		setSearchParams(value === 1 ? {} : { page: String(value) });
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	return (
		<div className="flex flex-col w-full">
			<div
				className="relative py-20 md:py-28 px-6 md:px-16 overflow-hidden"
				style={{ background: ORANGE_GRADIENT }}
			>
				<div className="absolute inset-0 opacity-10 pointer-events-none">
					<div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full filter blur-3xl" />
					<div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-400 rounded-full filter blur-3xl" />
				</div>
				<div className="max-w-5xl mx-auto relative z-10">
					<motion.span
						{...fadeUp(0)}
						className="inline-block bg-white/20 backdrop-blur-sm text-white text-[12px] font-bold tracking-wide px-4 py-1.5 rounded-full mb-5"
					>
						Join the team
					</motion.span>
					<motion.h1
						{...fadeUp(0.06)}
						className="text-[30px] md:text-[48px] font-extrabold text-white leading-tight mb-4"
					>
						Help build the platform millions of Africans trade, ship, and grow through
					</motion.h1>
					<motion.p
						{...fadeUp(0.12)}
						className="text-white/90 text-[16px] md:text-[18px] max-w-2xl"
					>
						Every open role is posted here first — apply directly with your AfricanShops account.
					</motion.p>
				</div>
			</div>

			<div className="bg-orange-50/40">
				<div className="max-w-7xl w-full mx-auto px-6 md:px-16 py-14">
					<motion.div
						{...fadeUp(0)}
						className="flex items-end justify-between flex-wrap gap-2 mb-8"
					>
						<div>
							<h2 className="text-[24px] font-extrabold text-gray-900">Open Positions</h2>
							<p className="text-[14px] text-gray-500 mt-1">
								{isLoading
									? 'Loading current openings…'
									: total > 0
										? `${total} role${total === 1 ? '' : 's'} open right now`
										: 'Nothing open right now — check back soon'}
							</p>
						</div>
					</motion.div>

					{isLoading && <LoadingGrid />}
					{!isLoading && positions.length === 0 && <EmptyState />}
					{!isLoading && positions.length > 0 && (
						<>
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
								{positions.map((position, index) => (
									<PositionCard
										key={position.id}
										position={position}
										index={index}
									/>
								))}
							</div>
							{pageCount > 1 && (
								<div className="flex justify-center mt-10">
									<Pagination
										count={pageCount}
										page={page}
										onChange={handlePageChange}
										shape="rounded"
										sx={{
											'& .MuiPaginationItem-root': { fontWeight: 600 },
											'& .MuiPaginationItem-root.Mui-selected': {
												background: ORANGE_GRADIENT,
												color: 'white'
											}
										}}
									/>
								</div>
							)}
						</>
					)}
				</div>
			</div>

			<PerksSection />
		</div>
	);
}

export default CareersListPage;
