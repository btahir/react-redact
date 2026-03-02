export interface PiiRow {
  label: string;
  value: string;
  masked: string;
  replaced: string;
}

export const piiRows: PiiRow[] = [
  {
    label: "Name",
    value: "Sarah Johnson",
    masked: "•••••••••••••",
    replaced: "Jane Demo",
  },
  {
    label: "Email",
    value: "sarah.johnson@acme.corp",
    masked: "•••••••••••••••••••••••",
    replaced: "jane.doe@example.com",
  },
  {
    label: "Phone",
    value: "(415) 555-0198",
    masked: "••••••••••••••",
    replaced: "(555) 200-4321",
  },
  {
    label: "SSN",
    value: "423-91-8847",
    masked: "•••-••-••••",
    replaced: "457-31-6802",
  },
  {
    label: "Card",
    value: "4532 8901 2345 6789",
    masked: "•••• •••• •••• ••••",
    replaced: "•••• •••• •••• ••••",
  },
  {
    label: "IP",
    value: "192.168.1.42",
    masked: "•••••••••••",
    replaced: "10.0.0.1",
  },
];

export const codeLines = [
  { code: 'import { RedactProvider, Redact, useRedactMode } from "react-redact";', type: "import" as const },
  { code: 'import "react-redact/styles.css";', type: "import" as const },
  { code: "", type: "blank" as const },
  { code: "function App() {", type: "keyword" as const },
  { code: "  return (", type: "default" as const },
  { code: '    <RedactProvider shortcut="mod+shift+x">', type: "jsx" as const },
  { code: "      <Dashboard />", type: "jsx" as const },
  { code: "    </RedactProvider>", type: "jsx" as const },
  { code: "  );", type: "default" as const },
  { code: "}", type: "keyword" as const },
];
