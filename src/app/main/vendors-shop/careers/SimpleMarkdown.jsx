import { Fragment } from 'react';

/**
 * Minimal renderer for the job-description markdown a position stores
 * (`## heading`, `- bullet`, blank-line-separated paragraphs, `**bold**`).
 * Deliberately not react-markdown — this app has no markdown renderer
 * installed yet, and pulling one in triggers Vite's dependency
 * re-optimization step, which crashed the dev server's esbuild service
 * under this host's current memory pressure while building the same page
 * on admin-web. The job descriptions here are simple enough that a small
 * hand-rolled parser covers them without that risk.
 */
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
			blocks.push(
				<h2
					key={`h2-${index}`}
					className="text-[20px] font-bold text-gray-900 mt-8 mb-3"
				>
					{line.slice(3)}
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
