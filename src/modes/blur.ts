export const blurClassName = "react-redact-blur";

export function getBlurProps(): {
	className: string;
	"data-redact": string;
	"aria-hidden": string;
} {
	return {
		className: blurClassName,
		"data-redact": "",
		"aria-hidden": "true",
	};
}
