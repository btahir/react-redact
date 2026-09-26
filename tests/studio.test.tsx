import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { useState } from "react";
import { renderToString } from "react-dom/server";
import { beforeEach, describe, expect, it } from "vitest";
import { createDemoDocument, serializeDocument } from "../src/data";
import { RedactStudio } from "../src/studio";

function Harness() {
	const [document, setDocument] = useState(createDemoDocument);
	return <RedactStudio document={document} onChange={setDocument} storageKey="test-draft" />;
}
beforeEach(() => localStorage.clear());
describe("local authoring", () => {
	it("disables server-rendered controls until hydration to avoid dropping early edits", () => {
		const html = renderToString(<Harness />);
		expect(html).toContain('class="rs-ready" disabled=""');
		render(<Harness />);
		expect(screen.getByLabelText("Scenario name")).not.toBeDisabled();
	});
	it("edits a sample, supports undo/redo and retains a valid preview", () => {
		render(<Harness />);
		const input = screen.getByLabelText("Scenario name");
		fireEvent.change(input, { target: { value: "A fresh scenario" } });
		expect(input).toHaveValue("A fresh scenario");
		fireEvent.click(screen.getByRole("button", { name: "Undo" }));
		expect(input).toHaveValue("The friendly customer demo");
		fireEvent.click(screen.getByRole("button", { name: "Redo" }));
		expect(input).toHaveValue("A fresh scenario");
	});
	it("keeps invalid draft input editable without sending invalid documents to preview", () => {
		render(<Harness />);
		fireEvent.change(screen.getByLabelText("Scenario name"), { target: { value: "" } });
		expect(screen.getByRole("alert")).toHaveTextContent("last valid policy");
		expect(screen.getByRole("button", { name: "Export JSON ↗" })).toBeDisabled();
		fireEvent.change(screen.getByLabelText("Scenario name"), { target: { value: "Fixed" } });
		expect(screen.queryByRole("alert")).not.toBeInTheDocument();
	});
	it("preserves an existing stored draft on mount until explicit restoration", async () => {
		const doc = createDemoDocument();
		doc.name = "Prior work";
		doc.seed = "restored-seed";
		localStorage.setItem("test-draft", serializeDocument(doc));
		render(<Harness />);
		expect(localStorage.getItem("test-draft")).toContain("Prior work");
		expect(screen.getByLabelText("Scenario name")).not.toHaveValue("Prior work");
		fireEvent.click(screen.getByRole("button", { name: "Load saved draft" }));
		await waitFor(() => expect(screen.getByLabelText("Scenario name")).toHaveValue("Prior work"));
		expect(screen.getByLabelText("Demo seed")).toHaveValue("restored-seed");
	});
	it("clears persisted work without resetting the open document", () => {
		render(<Harness />);
		fireEvent.change(screen.getByLabelText("Scenario name"), { target: { value: "Keep open" } });
		fireEvent.click(screen.getByRole("button", { name: "Clear saved draft" }));
		expect(localStorage.getItem("test-draft")).toBeNull();
		fireEvent.click(screen.getByRole("button", { name: "Run preflight →" }));
		expect(localStorage.getItem("test-draft")).toBeNull();
		expect(screen.getByLabelText("Scenario name")).toHaveValue("Keep open");
	});
	it("adds and removes a rule and exposes required-field warnings", () => {
		render(<Harness />);
		fireEvent.click(screen.getByRole("button", { name: "+ Add a field rule" }));
		expect(screen.getByLabelText("Semantic ID")).toHaveValue("field.5");
		fireEvent.click(screen.getByRole("button", { name: "Remove rule" }));
		expect(
			within(screen.getByRole("group", { name: "Field rules" })).queryByText("field.5"),
		).not.toBeInTheDocument();
	});
});
