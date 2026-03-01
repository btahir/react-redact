import { describe, expect, it } from "vitest";
import { getTextNodes } from "../../src/utils/dom-walker.js";

function setup(html: string): HTMLDivElement {
	const root = document.createElement("div");
	root.innerHTML = html;
	return root;
}

describe("getTextNodes", () => {
	it("collects text from simple elements", () => {
		const root = setup("<p>Hello world</p>");
		const nodes = getTextNodes(root);
		expect(nodes).toHaveLength(1);
		expect(nodes[0].text).toBe("Hello world");
	});

	it("collects text from nested elements", () => {
		const root = setup("<div><span>foo</span> <b>bar</b></div>");
		const nodes = getTextNodes(root);
		const texts = nodes.map((n) => n.text);
		expect(texts).toContain("foo");
		expect(texts).toContain("bar");
	});

	it("skips script tags", () => {
		const root = setup('<p>visible</p><script>alert("hidden")</script>');
		const nodes = getTextNodes(root);
		expect(nodes).toHaveLength(1);
		expect(nodes[0].text).toBe("visible");
	});

	it("skips style tags", () => {
		const root = setup("<p>visible</p><style>.foo { color: red }</style>");
		const nodes = getTextNodes(root);
		expect(nodes).toHaveLength(1);
		expect(nodes[0].text).toBe("visible");
	});

	it("skips noscript tags", () => {
		const root = setup("<p>visible</p><noscript>hidden</noscript>");
		const nodes = getTextNodes(root);
		expect(nodes).toHaveLength(1);
		expect(nodes[0].text).toBe("visible");
	});

	it("skips empty text nodes", () => {
		const root = setup("<p>   </p><p>content</p>");
		const nodes = getTextNodes(root);
		expect(nodes).toHaveLength(1);
		expect(nodes[0].text).toBe("content");
	});

	it("returns empty array for empty root", () => {
		const root = setup("");
		const nodes = getTextNodes(root);
		expect(nodes).toHaveLength(0);
	});

	it("returns actual Text node references", () => {
		const root = setup("<p>test</p>");
		const nodes = getTextNodes(root);
		expect(nodes[0].node).toBeInstanceOf(Text);
		expect(nodes[0].node.parentElement?.tagName).toBe("P");
	});

	it("handles deeply nested structures", () => {
		const root = setup("<div><div><div><span>deep</span></div></div></div>");
		const nodes = getTextNodes(root);
		expect(nodes).toHaveLength(1);
		expect(nodes[0].text).toBe("deep");
	});

	it("handles mixed content with multiple text nodes", () => {
		const root = setup("<p>one</p><p>two</p><p>three</p>");
		const nodes = getTextNodes(root);
		expect(nodes).toHaveLength(3);
		expect(nodes.map((n) => n.text)).toEqual(["one", "two", "three"]);
	});
});
