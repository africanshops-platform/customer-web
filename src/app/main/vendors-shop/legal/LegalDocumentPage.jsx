import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { CircularProgress } from '@mui/material';
import SimpleMarkdown, { slugify } from 'src/app/shared-components/SimpleMarkdown';
import { ORANGE_GRADIENT, fadeUp } from 'src/app/shared-components/africanShopsTheme';
import { useLegalDocument } from 'src/app/aaqueryhooks/legalDocumentQueries';

/** The shared page every keyed legal document (privacy policy, terms &
 * conditions, ...) renders through — one component, one visual treatment,
 * so a new policy type never means a new one-off page. Mirrors civic-web's
 * LegalDocumentPage (sticky table-of-contents included, once a document
 * has more than 3 `##` sections); ported rather than shared since these
 * are separate deployed apps with no shared package between them. */

/** Pulls every `## Heading` line out of the raw markdown to build a table
 * of contents — SimpleMarkdown stamps the matching id on each h2 itself
 * (via the same slugify), so these just become #anchor links. */
function extractHeadings(markdown) {
	if (!markdown) return [];
	const lines = markdown.split('\n');
	const headings = [];

	lines.forEach((line) => {
		const match = /^##\s+(.+)$/.exec(line.trim());

		if (match) {
			headings.push({ text: match[1].trim(), id: slugify(match[1]) });
		}
	});

	return headings;
}

function LoadingState() {
	return (
		<div className="w-full min-h-[70vh] flex items-center justify-center">
			<CircularProgress sx={{ color: '#ea580c' }} />
		</div>
	);
}

function NotPublishedState({ title }) {
	return (
		<div className="w-full min-h-[70vh] flex items-center justify-center">
			<div className="max-w-lg mx-auto text-center px-6 py-24">
				<motion.div {...fadeUp(0)}>
					<div className="w-18 h-18 rounded-2xl bg-white border border-orange-100 shadow-sm flex items-center justify-center mx-auto mb-6">
						<MenuBookIcon sx={{ fontSize: 32, color: '#ea580c' }} />
					</div>
					<h1 className="text-[24px] font-extrabold text-gray-800 mb-3">
						{title || 'This document'} isn&apos;t published yet
					</h1>
					<p className="text-[15px] text-gray-500 leading-relaxed mb-7">
						We&apos;re still finalizing this page. Check back soon, or head back to the home page in the
						meantime.
					</p>
					<Link
						to="/"
						className="inline-flex items-center gap-2 no-underline"
						style={{
							background: ORANGE_GRADIENT,
							color: 'white',
							fontWeight: 700,
							padding: '10px 22px',
							borderRadius: 12
						}}
					>
						<ArrowBackIcon fontSize="small" /> Back to home
					</Link>
				</motion.div>
			</div>
		</div>
	);
}

function LegalDocumentPage({ documentKey, eyebrow = 'Legal' }) {
	const { data: doc, isLoading, isError } = useLegalDocument(documentKey);
	const [activeSection, setActiveSection] = useState(null);

	const headings = useMemo(() => extractHeadings(doc?.content), [doc?.content]);

	if (isLoading) return <LoadingState />;

	if (isError || !doc) return <NotPublishedState />;

	const lastUpdated = doc.publishedAt || doc.updatedAt;
	const hasToc = headings.length > 3;

	return (
		<div className="w-full">
			<div
				className="relative py-16 md:py-20 px-6 md:px-16 overflow-hidden"
				style={{ background: ORANGE_GRADIENT }}
			>
				<div className="max-w-5xl mx-auto relative z-10">
					<motion.div {...fadeUp(0)}>
						<Link
							to="/"
							className="inline-flex items-center gap-1.5 no-underline text-white/85 text-[14px] font-medium mb-5"
						>
							<ArrowBackIcon fontSize="small" /> Back to home
						</Link>
					</motion.div>

					<motion.span
						{...fadeUp(0.05)}
						className="inline-block bg-white/20 backdrop-blur-sm text-white text-[12px] font-bold px-4 py-1.5 rounded-full mb-4"
					>
						{eyebrow}
					</motion.span>

					<motion.h1
						{...fadeUp(0.1)}
						className="text-[28px] md:text-[40px] font-extrabold text-white leading-tight mb-3"
						style={{ textWrap: 'balance' }}
					>
						{doc.title}
					</motion.h1>

					{lastUpdated && (
						<motion.div
							{...fadeUp(0.16)}
							className="inline-flex items-center gap-1.5 text-white/85 text-[14px]"
						>
							<ScheduleIcon fontSize="small" />
							Last updated{' '}
							{new Date(lastUpdated).toLocaleDateString('en-US', {
								year: 'numeric',
								month: 'long',
								day: 'numeric'
							})}
						</motion.div>
					)}
				</div>
			</div>

			{/* grid-cols-1 on mobile always; the 260px ToC column only kicks in
			    at lg+ once there are enough sections to be worth a ToC at all. */}
			<div
				className={
					hasToc ? 'grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_260px]' : 'grid grid-cols-1'
				}
				style={{ maxWidth: 1080, margin: '0 auto', gap: 'clamp(24px, 4vw, 56px)', alignItems: 'start' }}
			>
				<div className="max-w-4xl mx-auto lg:mx-0 w-full px-6 md:px-16 py-12 md:py-14 lg:pl-16 lg:pr-0 min-w-0">
					<motion.div
						{...fadeUp(0.1)}
						className="bg-white border border-orange-100 rounded-2xl shadow-sm p-6 md:p-12 min-w-0"
					>
						<SimpleMarkdown content={doc.content} />
					</motion.div>
				</div>

				{hasToc && (
					<motion.nav
						{...fadeUp(0.18)}
						aria-label="Table of contents"
						className="hidden lg:block"
						style={{
							position: 'sticky',
							top: 24,
							marginTop: 'clamp(48px, 7vh, 56px)',
							marginRight: 'clamp(20px, 5vw, 64px)',
							background: 'rgba(255,255,255,0.75)',
							border: '1px solid #fdecdc',
							borderRadius: 20,
							padding: '20px 22px'
						}}
					>
						<div
							style={{
								fontSize: 12,
								fontWeight: 800,
								color: '#9a3412',
								marginBottom: 12,
								letterSpacing: '0.02em'
							}}
						>
							ON THIS PAGE
						</div>
						<ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
							{headings.map((h) => (
								<li key={h.id}>
									<a
										href={`#${h.id}`}
										onClick={() => setActiveSection(h.id)}
										style={{
											fontSize: 12.5,
											color: activeSection === h.id ? '#ea580c' : '#6b7280',
											fontWeight: activeSection === h.id ? 700 : 500,
											textDecoration: 'none',
											lineHeight: 1.4,
											display: 'block'
										}}
									>
										{h.text}
									</a>
								</li>
							))}
						</ul>
					</motion.nav>
				)}
			</div>
		</div>
	);
}

export default LegalDocumentPage;
