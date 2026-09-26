"use client";
import { createContext, type ReactElement, type ReactNode, useContext, useMemo } from "react";
import { type DemoDocument, sampleField, validateDocument } from "./data.js";

const DemoContext = createContext<DemoDocument | null>(null);
export interface DemoProviderProps {
	document: DemoDocument;
	children: ReactNode;
}
export function DemoProvider({ document, children }: DemoProviderProps): ReactElement {
	const validated = useMemo(() => {
		const result = validateDocument(document);
		if (!result.valid)
			throw new Error(
				`Invalid demo policy: ${result.issues.map((issue) => issue.path).join(", ")}`,
			);
		return result.document;
	}, [document]);
	return <DemoContext.Provider value={validated}>{children}</DemoContext.Provider>;
}
export interface DemoFieldProps {
	id: string;
	entity?: string;
	/** Optional original is shown only outside DemoProvider. Prefer synthetic-only demos. */
	children?: ReactNode;
	className?: string;
}
/** Replaces at render time, including SSR. A missing configured field stays hidden. */
export function DemoField({
	id,
	entity = "demo-1",
	children,
	className,
}: DemoFieldProps): ReactElement {
	const document = useContext(DemoContext);
	if (!document) return <span className={className}>{children}</span>;
	const rule = document.fields.find((field) => field.id === id);
	const content = rule ? sampleField(document, rule, entity) : "Unconfigured demo field";
	return (
		<span
			className={className}
			data-redact-field={id}
			data-redact-status={rule ? "covered" : "missing"}
			data-redact-behavior={rule?.behavior ?? "hide"}
		>
			{rule?.behavior === "mask" || rule?.behavior === "hide" ? (
				<span role="img" aria-label={`${rule.label}: hidden for this demo`}>
					{content}
				</span>
			) : (
				content
			)}
		</span>
	);
}
