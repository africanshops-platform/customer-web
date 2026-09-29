import { Fragment } from 'react';

/**
 * Minimal renderer for simple markdown content (`## heading`, `### h3`,
 * `- bullet`, blank-line-separated paragraphs, `**bold**`) — used by the
 * careers job-description and the legal-document pages. Deliberately not
 * react-markdown — this app has no markdown renderer installed, and
 * pulling one in triggers Vite's dependency re-optimization step, which
 * crashed the dev server's esbuild service under this host's memory
 * pressure while building a page on admin-web. Both use cases here are
 * simple enough that a small hand-rolled parser covers them without that
 * risk.
 */
/** Same slugify a heading's id needs to match, both when SimpleMarkdown
 * stamps it and when a page builds a table-of-contents anchor pointing at
 * it — exported so both agree on the same id for the same heading text. */
export function slugify(text) {
	return String(text)
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, '')
		.replace(/\s+/g, '-');
}

function renderInline(text, key) {
	const parts = text.split(/(\*\*[^*]+\*\*)/g);
	return (
		<p
			key={key}
			className="text-gray-700 leading-relaxed mb-4"
		>
			{parts.map((part, i) =>
				part.startsWith('**') && part.endsWith('**') ? (
					<strong
						key={i}
						className="text-gray-900 font-semibold"
					>
						{part.slice(2, -2)}
					</strong>
				) : (
					<Fragment key={i}>{part}</Fragment>
				)
			)}
		</p>
	);
}

function SimpleMarkdown({ content }) {
	if (!content) return null;

	const lines = content.split('\n');
	const blocks = [];
	let listItems = [];

	function flushList() {
		if (listItems.length > 0) {
			blocks.push(
				<ul
					key={`ul-${blocks.length}`}
					className="list-disc pl-5 mb-4 space-y-1.5"
				>
					{listItems.map((item, i) => (
						<li
							key={i}
							className="text-gray-700 leading-relaxed"
						>
							{item}
						</li>
					))}
				</ul>
			);
			listItems = [];
		}
	}

	lines.forEach((rawLine, index) => {
		const line = rawLine.trim();

		if (line.startsWith('## ')) {
			flushList();
			const text = line.slice(3);
			blocks.push(
				<h2
					key={`h2-${index}`}
					id={slugify(text)}
					className="text-[20px] font-bold text-gray-900 mt-8 mb-3"
					style={{ scrollMarginTop: 96 }}
				>
					{text}
				</h2>
			);
		} else if (line.startsWith('### ')) {
			flushList();
			blocks.push(
				<h3
					key={`h3-${index}`}
					className="text-[18px] font-semibold text-gray-900 mt-6 mb-2"
				>
					{line.slice(4)}
				</h3>
			);
		} else if (line.startsWith('# ')) {
			flushList();
			blocks.push(
				<h1
					key={`h1-${index}`}
					className="text-[24px] font-extrabold text-gray-900 mt-2 mb-4"
				>
					{line.slice(2)}
				</h1>
			);
		} else if (line.startsWith('> ')) {
			flushList();
			blocks.push(
				<blockquote
					key={`bq-${index}`}
					className="border-l-4 border-orange-300 bg-orange-50 text-orange-900 rounded-r-lg px-4 py-3 mb-4 text-[13.5px] leading-relaxed"
				>
					{line.slice(2)}
				</blockquote>
			);
		} else if (line.startsWith('- ')) {
			listItems.push(line.slice(2));
		} else if (line) {
			flushList();
			blocks.push(renderInline(line, `p-${index}`));
		}
	});
	flushList();

	return <div>{blocks}</div>;
}

export default SimpleMarkdown;
