import { createDemoDocument, createDemoRecord } from "react-redact/data";
export async function GET() {
  // The endpoint has no database, credentials, or original customer records.
  await new Promise(resolve => setTimeout(resolve, 300));
  return Response.json(createDemoRecord(createDemoDocument(), 'async-demo'));
}
