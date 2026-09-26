import { StrictMode, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createDemoDocument } from 'react-redact/data';
import { DemoProvider, DemoField } from 'react-redact/fields';
import { RedactStudio } from 'react-redact/studio';
import 'react-redact/studio.css';
import './style.css';
function App() {
  const [document, setDocument] = useState(createDemoDocument);
  const rootRef = useRef<HTMLDivElement>(null);
  return <main><header><p>REACT-REDACT / LOCAL EXAMPLE</p><h1>Your next demo starts here.</h1><p>Every record below is generated. No account or data service.</p></header><div className="layout"><div ref={rootRef} className="preview"><DemoProvider document={document}>{['demo-1','demo-2','demo-3'].map(entity => <article key={entity}><h2><DemoField id="customer.name" entity={entity} /></h2><p><DemoField id="customer.email" entity={entity} /></p><p><DemoField id="customer.company" entity={entity} /></p><strong><DemoField id="invoice.total" entity={entity} /></strong></article>)}</DemoProvider></div><RedactStudio document={document} onChange={setDocument} rootRef={rootRef} storageKey="vite-redact-demo" /></div></main>;
}
createRoot(window.document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
