"use client";
import {
	type ChangeEvent,
	type ReactElement,
	type RefObject,
	useEffect,
	useId,
	useRef,
	useState,
} from "react";
import {
	createDemoDocument,
	type DemoDocument,
	FIELD_KINDS,
	type FieldRule,
	parseDocument,
	sampleField,
	serializeDocument,
	validateDocument,
} from "./data.js";
import { inspectDemo, type PreflightReport } from "./diagnostics.js";
export interface RedactStudioProps {
	document: DemoDocument;
	onChange: (document: DemoDocument) => void;
	/** Restrict target picking and diagnostics to this application region. */
	rootRef?: RefObject<HTMLElement | null>;
	/** Opt in to local draft storage. Documents contain only authored rules/sample values. */
	storageKey?: string;
}
export function RedactStudio({
	document: incoming,
	onChange,
	rootRef,
	storageKey,
}: RedactStudioProps): ReactElement {
	const [ready, setReady] = useState(false);
	useEffect(() => setReady(true), []);
	const [history, setHistory] = useState<DemoDocument[]>([incoming]);
	const [position, setPosition] = useState(0);
	const [selected, setSelected] = useState(incoming.fields[0]?.id ?? "");
	const [picking, setPicking] = useState(false);
	const [report, setReport] = useState<PreflightReport | null>(null);
	const [message, setMessage] = useState("");
	const [edited, setEdited] = useState(false);
	const importRef = useRef<HTMLInputElement>(null);
	const current = history[position];
	const currentRef = useRef(current);
	currentRef.current = current;
	const id = useId();
	const validation = validateDocument(current);
	const field = current.fields.find((rule) => rule.id === selected);
	useEffect(() => {
		if (JSON.stringify(incoming) !== JSON.stringify(currentRef.current)) {
			setHistory([incoming]);
			setPosition(0);
			setSelected(incoming.fields[0]?.id ?? "");
		}
	}, [incoming]);
	useEffect(() => {
		if (!storageKey) return;
		try {
			if (localStorage.getItem(storageKey))
				setMessage("A saved local draft is available. Choose Load saved draft to restore it.");
		} catch {
			setMessage("Local storage is unavailable. You can still edit and export JSON.");
		}
	}, [storageKey]);
	useEffect(() => {
		if (!storageKey || !edited || !validateDocument(current).valid) return;
		try {
			localStorage.setItem(storageKey, serializeDocument(current));
		} catch {
			setMessage("Draft could not be saved locally. Export JSON to keep your work.");
		}
	}, [current, storageKey, edited]);
	function commit(next: DemoDocument) {
		setEdited(true);
		setHistory((previous) => [...previous.slice(0, position + 1).slice(-49), next]);
		setPosition(Math.min(position + 1, 49));
		setReport(null);
		const result = validateDocument(next);
		if (result.valid) onChange(result.document);
	}
	function move(nextPosition: number) {
		setEdited(true);
		const next = history[nextPosition];
		setPosition(nextPosition);
		setReport(null);
		if (validateDocument(next).valid) onChange(next);
	}
	function patchField(patch: Partial<FieldRule>) {
		commit({
			...current,
			fields: current.fields.map((rule) => (rule.id === selected ? { ...rule, ...patch } : rule)),
		});
		if (patch.id !== undefined) setSelected(patch.id);
	}
	function preflight() {
		if (!validation.valid) return;
		const root = rootRef?.current ?? window.document.body;
		const result = inspectDemo(root, current);
		setReport(result);
		setMessage(
			result.ready
				? "Declared targets are covered in this view. Review candidates and unchecked surfaces."
				: "Some declared targets need attention.",
		);
	}
	useEffect(() => {
		if (!picking) return;
		const root = rootRef?.current ?? window.document.body;
		const click = (event: MouseEvent) => {
			const element =
				event.target instanceof Element
					? event.target.closest<HTMLElement>("[data-redact-field]")
					: null;
			if (!element || !root.contains(element)) return;
			event.preventDefault();
			event.stopPropagation();
			const targetId = element.dataset.redactField ?? "";
			setSelected(targetId);
			setPicking(false);
			setMessage(`Selected ${targetId}`);
		};
		const onEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape") setPicking(false);
		};
		root.addEventListener("click", click, true);
		window.addEventListener("keydown", onEscape);
		return () => {
			root.removeEventListener("click", click, true);
			window.removeEventListener("keydown", onEscape);
		};
	}, [picking, rootRef]);
	useEffect(() => {
		const root = rootRef?.current ?? window.document.body;
		let targets: HTMLElement[] = [];
		const highlight = () => {
			for (const target of targets) target.removeAttribute("data-redact-selected");
			targets = [...root.querySelectorAll<HTMLElement>("[data-redact-field]")].filter(
				(el) => el.dataset.redactField === selected,
			);
			for (const target of targets) target.setAttribute("data-redact-selected", "");
		};
		highlight();
		const observer = new MutationObserver(highlight);
		observer.observe(root, {
			childList: true,
			subtree: true,
			attributes: true,
			attributeFilter: ["data-redact-field"],
		});
		return () => {
			observer.disconnect();
			for (const target of targets) target.removeAttribute("data-redact-selected");
		};
	}, [selected, rootRef]);

	useEffect(() => {
		if (!report) return;
		const root = rootRef?.current ?? window.document.body;
		const observer = new MutationObserver((records) => {
			if (
				records.some((record) => {
					const target =
						record.target.nodeType === 1 ? (record.target as Element) : record.target.parentElement;
					return !target?.closest("[data-redact-studio]");
				})
			) {
				setReport(null);
				setMessage("The preview changed. Run preflight again for this view.");
			}
		});
		observer.observe(root, {
			childList: true,
			subtree: true,
			characterData: true,
			attributes: true,
			attributeFilter: ["data-redact-field", "data-redact-status", "value", "open"],
		});
		return () => observer.disconnect();
	}, [report, rootRef]);

	async function importFile(event: ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0];
		event.target.value = "";
		if (!file) return;
		try {
			if (file.size > 256_000) throw new Error("Document exceeds 256 KB");
			const next = parseDocument(await file.text());
			commit(next);
			setSelected(next.fields[0]?.id ?? "");
			setMessage("Policy imported. Review authored values before sharing.");
		} catch (error) {
			setMessage(error instanceof Error ? error.message : "Import failed");
		}
	}
	function exportFile() {
		try {
			const url = URL.createObjectURL(
				new Blob([serializeDocument(current)], { type: "application/json" }),
			);
			const anchor = window.document.createElement("a");
			anchor.href = url;
			anchor.download = "redact-demo.json";
			anchor.click();
			setTimeout(() => URL.revokeObjectURL(url), 1000);
			setMessage("Policy exported. No page text was captured.");
		} catch {
			setMessage("Fix document errors before exporting.");
		}
	}
	function loadDraft() {
		try {
			const raw = storageKey ? localStorage.getItem(storageKey) : null;
			if (!raw) {
				setMessage("No saved draft found.");
				return;
			}
			const next = parseDocument(raw);
			commit(next);
			setSelected(next.fields[0]?.id ?? "");
			setMessage("Local draft restored.");
		} catch {
			setMessage("This local draft could not be loaded.");
		}
	}
	return (
		<section className="redact-studio" data-redact-studio aria-label="Redact Studio">
			<fieldset className="rs-ready" disabled={!ready} aria-label="Demo authoring controls">
				<header className="rs-heading">
					<div>
						<span className="rs-eyebrow">YOUR DEMO, YOUR RULES</span>
						<h2>
							Redact Studio
							<span className="rs-dot" />
						</h2>
					</div>
					<span className="rs-local">Local only</span>
				</header>
				<nav className="rs-toolbar" aria-label="Document actions">
					<button
						type="button"
						onClick={() => move(position - 1)}
						disabled={position === 0}
						aria-label="Undo"
					>
						↶ Undo
					</button>
					<button
						type="button"
						onClick={() => move(position + 1)}
						disabled={position === history.length - 1}
						aria-label="Redo"
					>
						↷ Redo
					</button>
					<button type="button" onClick={() => importRef.current?.click()}>
						Import
					</button>
					<button type="button" onClick={exportFile} disabled={!validation.valid}>
						Export JSON ↗
					</button>
					<input
						ref={importRef}
						type="file"
						accept="application/json,.json"
						aria-label="Import policy file"
						onChange={importFile}
						hidden
					/>
				</nav>
				<div className="rs-scenario">
					<label htmlFor={`${id}-name`}>
						Scenario name
						<input
							id={`${id}-name`}
							value={current.name}
							onChange={(event) => commit({ ...current, name: event.target.value })}
							maxLength={120}
						/>
					</label>
					<div className="rs-columns">
						<label htmlFor={`${id}-seed`}>
							Demo seed
							<input
								id={`${id}-seed`}
								value={current.seed}
								onChange={(event) => commit({ ...current, seed: event.target.value })}
								maxLength={120}
							/>
						</label>
						<label htmlFor={`${id}-date`}>
							Reference date
							<input
								id={`${id}-date`}
								type="date"
								value={current.referenceDate}
								onChange={(event) => commit({ ...current, referenceDate: event.target.value })}
							/>
						</label>
					</div>
				</div>
				<div className="rs-section-title">
					<h3>
						Declared fields <span>{current.fields.length}</span>
					</h3>
					<button type="button" aria-pressed={picking} onClick={() => setPicking(!picking)}>
						{picking ? "Cancel picking" : "⌖ Pick a field"}
					</button>
				</div>
				{picking && (
					<p className="rs-help">
						Click a registered field in your preview. Press Escape to cancel. The list below also
						works with a keyboard.
					</p>
				)}
				<fieldset className="rs-fields" aria-label="Field rules">
					{current.fields.map((rule) => (
						<button
							type="button"
							key={rule.id}
							className={rule.id === selected ? "rs-field rs-active" : "rs-field"}
							aria-pressed={rule.id === selected}
							onClick={() => setSelected(rule.id)}
						>
							<span>
								<strong>{rule.label || "Unnamed field"}</strong>
								<small>{rule.id || "Missing ID"}</small>
							</span>
							<span className="rs-tag">{rule.behavior}</span>
						</button>
					))}
				</fieldset>
				<button
					className="rs-add"
					type="button"
					disabled={current.fields.length >= 200}
					onClick={() => {
						let index = current.fields.length + 1;
						while (current.fields.some((rule) => rule.id === `field.${index}`)) index++;
						const next: FieldRule = {
							id: `field.${index}`,
							label: `Field ${index}`,
							kind: "text",
							behavior: "sample",
							required: false,
						};
						commit({ ...current, fields: [...current.fields, next] });
						setSelected(next.id);
					}}
				>
					+ Add a field rule
				</button>
				{field ? (
					<fieldset className="rs-editor">
						<legend>Edit {field.label || "field"}</legend>
						<div className="rs-columns">
							<label htmlFor={`${id}-field`}>
								Semantic ID
								<input
									id={`${id}-field`}
									value={field.id}
									onChange={(event) => patchField({ id: event.target.value })}
								/>
							</label>
							<label htmlFor={`${id}-label`}>
								Display label
								<input
									id={`${id}-label`}
									value={field.label}
									onChange={(event) => patchField({ label: event.target.value })}
								/>
							</label>
						</div>
						<div className="rs-columns">
							<label htmlFor={`${id}-kind`}>
								Sample type
								<select
									id={`${id}-kind`}
									value={field.kind}
									onChange={(event) =>
										patchField({ kind: event.target.value as FieldRule["kind"] })
									}
								>
									{FIELD_KINDS.map((kind) => (
										<option key={kind}>{kind}</option>
									))}
								</select>
							</label>
							<label htmlFor={`${id}-behavior`}>
								Behavior
								<select
									id={`${id}-behavior`}
									value={field.behavior}
									onChange={(event) =>
										patchField({ behavior: event.target.value as FieldRule["behavior"] })
									}
								>
									<option value="sample">Synthetic sample</option>
									<option value="mask">Fixed mask</option>
									<option value="hide">Hidden label</option>
								</select>
							</label>
						</div>
						<label htmlFor={`${id}-replacement`}>
							Optional authored sample
							<input
								id={`${id}-replacement`}
								placeholder="Use the generated sample"
								value={field.replacement ?? ""}
								maxLength={500}
								onChange={(event) => patchField({ replacement: event.target.value || undefined })}
							/>
						</label>
						<p className="rs-help">
							Only enter invented demo values. Authored samples are included in exports.
						</p>
						<label className="rs-checkbox">
							<input
								type="checkbox"
								checked={field.required}
								onChange={(event) => patchField({ required: event.target.checked })}
							/>
							Required in this view
						</label>
						<div className="rs-sample">
							<span>PREVIEW · DEMO-1</span>
							<strong>
								{validation.valid ? sampleField(current, field) : "Fix document errors to preview"}
							</strong>
						</div>
						<button
							type="button"
							className="rs-delete"
							onClick={() => {
								const next = current.fields.filter((rule) => rule !== field);
								commit({ ...current, fields: next });
								setSelected(next[0]?.id ?? "");
							}}
						>
							Remove rule
						</button>
					</fieldset>
				) : (
					<p className="rs-help">Select a declared field, or add a rule for the selected target.</p>
				)}
				{!validation.valid && (
					<div role="alert" className="rs-errors">
						<strong>Preview uses the last valid policy.</strong>
						<ul>
							{validation.issues.map((issue) => (
								<li key={`${issue.path}:${issue.message}`}>
									{issue.path}: {issue.message}
								</li>
							))}
						</ul>
					</div>
				)}
				<div className="rs-preflight">
					<div>
						<span className="rs-eyebrow">BEFORE YOU PRESENT</span>
						<h3>Check this view</h3>
					</div>
					<button
						type="button"
						className="rs-primary"
						onClick={preflight}
						disabled={!validation.valid}
					>
						Run preflight →
					</button>
				</div>
				{report && (
					<div className="rs-report">
						<strong>
							{report.fields.filter((item) => item.status === "covered").length} /{" "}
							{report.fields.length} fields present
						</strong>
						<ul>
							{report.fields.map((item) => (
								<li key={item.id}>
									<span>{item.label}</span>
									<span>
										{item.status} · {item.count}
									</span>
								</li>
							))}
						</ul>
						{report.unknownFields.length > 0 && (
							<p>Unconfigured targets: {report.unknownFields.join(", ")}</p>
						)}
						<p>
							{report.candidateCount} unregistered pattern candidates. Synthetic text may also
							match.
						</p>
						{report.unsupported.length > 0 && (
							<p>
								Unchecked surfaces:{" "}
								{report.unsupported.map((item) => `${item.surface} (${item.count})`).join(", ")}.
							</p>
						)}
						<p className="rs-help">{report.limitations.join(" ")}</p>
					</div>
				)}
				<output className="rs-status">{message}</output>
				<footer className="rs-footer">
					{storageKey && (
						<>
							<button type="button" onClick={loadDraft}>
								Load saved draft
							</button>
							<button
								type="button"
								onClick={() => {
									try {
										localStorage.removeItem(storageKey);
										setEdited(false);
										setMessage("Saved draft cleared; your open document is unchanged.");
									} catch {
										setMessage("Storage unavailable.");
									}
								}}
							>
								Clear saved draft
							</button>
						</>
					)}
					<button
						type="button"
						onClick={() => {
							const next = createDemoDocument();
							commit(next);
							setSelected(next.fields[0].id);
						}}
					>
						Reset sample
					</button>
					<p>Free & MIT licensed. No account. No data upload.</p>
				</footer>
			</fieldset>
		</section>
	);
}
