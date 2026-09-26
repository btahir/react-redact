"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DemoField, DemoProvider } from "react-redact/fields";
import { RedactStudio } from "react-redact/studio";
import { createDemoDocument, createIdentity, type DemoDocument } from "react-redact/data";
import "react-redact/studio.css";
import styles from "./workspace.module.css";
export function DemoWorkspace({ initialDocument, view = "overview", compact = false }: { initialDocument?: DemoDocument; view?: string; compact?: boolean }) {
  const [policy, setPolicy] = useState(initialDocument ?? createDemoDocument);
  const [entity, setEntity] = useState("demo-1");
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [record, setRecord] = useState<Record<string, string> | null>(null);
  const [tab, setTab] = useState(view);
  const pathname = usePathname();
  const activeView = compact ? tab : pathname.split("/").at(-1) ?? "overview";
  const rootRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  async function loadInvoice() {
    controller.current?.abort();
    const request = new AbortController(); controller.current = request;
    setLoading(true); setError("");
    try {
      const response = await fetch('/api/demo', { signal: request.signal });
      if (!response.ok) throw new Error('The sample could not load. Try again.');
      const data = await response.json();
      setRecord(data); setLoaded(true);
    } catch (issue) { if (!request.signal.aborted) setError(issue instanceof Error ? issue.message : 'Sample unavailable'); }
    finally { if (!request.signal.aborted) setLoading(false); }
  }
  return <div className={styles.workspace}>
    <div className={styles.previewColumn}>
      <div className={styles.caption}><span><i /> LIVE REACT APP</span><span>Invented data. Real components.</span></div>
      <div className={styles.app} ref={rootRef} data-testid="demo-preview">
        <DemoProvider document={policy}>
          <header className={styles.appHeader}><div className={styles.brand}><span>j</span>juniper<span className={styles.tag}>workspace</span></div><span className={styles.avatar}>JD</span></header>
          <nav className={styles.appNav} aria-label="Demo views">{["overview", "customers", "invoices"].map(item => compact ? <button type="button" key={item} onClick={() => setTab(item)} aria-current={tab === item ? "page" : undefined}>{item}</button> : <Link key={item} href={`/studio/${item}`} aria-current={activeView === item ? "page" : undefined}>{item}</Link>)}</nav>
          <div className={styles.appBody}>
            <div className={styles.welcome}><div><span className={styles.kicker}>{activeView === 'invoices' ? 'BILLING / SEPTEMBER' : 'YOUR CUSTOMER WORKSPACE'}</span><h2>{activeView === 'customers' ? 'Good people. Good work.' : activeView === 'invoices' ? 'Keep the work flowing.' : 'A calmer working day.'}</h2><p>Everything you need for the next conversation.</p></div><button type="button" className={styles.outlineButton} onClick={() => dialogRef.current?.showModal()}>View customer ↗</button></div>
            {activeView === "overview" && <div className={styles.stats}><div><span>Monthly revenue</span><strong><DemoField id="invoice.total" entity={entity} /></strong><small>↗ 12.8% this month</small></div><div><span>Active projects</span><strong>24<span> / 32</span></strong><small>Eight ideas in the making</small></div><div><span>Happy customers</span><strong>98<span>%</span></strong><small>A little care goes a long way</small></div></div>}
            {activeView !== "invoices" && <><div className={styles.customerHeader}><h3>{activeView === "customers" ? "Customer directory" : "Your people"}</h3><span>3 synthetic customers</span></div>
            <div className={styles.customers}>{['demo-1','demo-2','demo-3'].map((key,index) => <button type="button" className={styles.customer} key={key} onClick={() => { setEntity(key); dialogRef.current?.showModal(); }} aria-label={`Open demo customer ${index+1}`}><span className={styles.customerAvatar}>{createIdentity(policy.seed, key).name.split(" ").map(part => part[0]).join("")}</span><span><strong><DemoField id="customer.name" entity={key} /></strong><small><DemoField id="customer.email" entity={key} /></small></span><span className={styles.company}><DemoField id="customer.company" entity={key} /></span><span className={styles.customerArrow}>↗</span></button>)}</div></>}
            {activeView === "invoices" && <><div className={styles.customerHeader}><h3>Invoices · Sample ledger</h3><span>3 generated records</span></div><div className={styles.invoiceTable}><table><thead><tr><th scope="col">Customer</th><th scope="col">Invoice</th><th scope="col">Amount</th><th scope="col">Status</th></tr></thead><tbody>{["demo-1","demo-2","demo-3"].map((key,index) => <tr key={key}><td><button type="button" onClick={() => { setEntity(key); dialogRef.current?.showModal(); }}><DemoField id="customer.name" entity={key} /></button><small><DemoField id="customer.email" entity={key} /></small><small><DemoField id="customer.company" entity={key} /></small></td><td>DEMO-{101+index}</td><td><DemoField id="invoice.total" entity={key} /></td><td><span className={styles.invoiceStatus}>{index === 1 ? "Pending" : "Paid"}</span></td></tr>)}</tbody></table></div><p className={styles.ledgerNote}>A fictional ledger for presentation. No payments, customer records, or billing actions are connected.</p></>}
            <div className={styles.bottomGrid}><div className={styles.note}><span className={styles.kicker}>A LITTLE MOMENT OF CLARITY</span><h3>More doing.<br />Less preparing.</h3><p>Change the scenario seed in Studio. Names, emails, and companies stay consistent everywhere.</p><div className={styles.plant} aria-hidden="true">✳</div></div><div className={styles.activity}><h3>Next on your list</h3><p><span className={styles.check}>✓</span> Customer updates prepared</p><p><span className={styles.check}>✓</span> Sample data in place</p><button type="button" className={styles.loadButton} onClick={loadInvoice} disabled={loading}>{loading ? 'Loading sample…' : loaded ? 'Reload async sample ↻' : 'Load async sample →'}</button>{record && <p className={styles.asyncRecord} data-testid="async-record">API sample: {record['customer.name']}<small>Generated server-side. No customer database.</small></p>}{error && <p role="alert">{error}</p>}</div></div>
          </div>
          <footer className={styles.appFooter}><span>● Synthetic-only workspace</span><span>Built with react-redact</span></footer>
          <dialog ref={dialogRef} className={styles.dialog} aria-labelledby="customer-dialog-title"><div className={styles.dialogHeader}><span className={styles.kicker}>CUSTOMER DETAILS</span><button type="button" onClick={() => dialogRef.current?.close()} aria-label="Close customer details">×</button></div><h2 id="customer-dialog-title"><DemoField id="customer.name" entity={entity} /></h2><p><DemoField id="customer.email" entity={entity} /></p><p><DemoField id="customer.company" entity={entity} /></p><hr /><p>Same person. Same details. Every view.</p><button type="button" className={styles.loadButton} onClick={() => dialogRef.current?.close()}>Back to workspace</button></dialog>
        </DemoProvider>
      </div>
      <div className={styles.previewNote}><span>↳</span><p>This preview never loads real customer data. The editor exports your field rules and authored samples—not a copy of the page.</p></div>
    </div>
    <RedactStudio document={policy} onChange={setPolicy} rootRef={rootRef} storageKey="react-redact-demo-v1" />
  </div>;
}
