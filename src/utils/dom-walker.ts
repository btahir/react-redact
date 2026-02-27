/**
 * Collect all direct text content from text nodes under root.
 * Does not cross into iframes or shadow roots.
 */
export function getTextNodes(root: Node): { node: Text; text: string }[] {
	const result: { node: Text; text: string }[] = [];
	const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
		acceptNode(node) {
			// Skip script, style, and empty
			const parent = node.parentElement;
			if (!parent) return NodeFilter.FILTER_REJECT;
			const tag = parent.tagName.toLowerCase();
			if (tag === "script" || tag === "style" || tag === "noscript")
				return NodeFilter.FILTER_REJECT;
			if (!node.textContent?.trim()) return NodeFilter.FILTER_REJECT;
			return NodeFilter.FILTER_ACCEPT;
		},
	});
	for (let n = walker.nextNode(); n !== null; n = walker.nextNode()) {
		const text = n.textContent ?? "";
		if (text.length > 0) result.push({ node: n as Text, text });
	}
	return result;
}
