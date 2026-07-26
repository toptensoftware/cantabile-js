import { Cantabile } from "@toptensoftware/cantabile-js";

// Create Cantabile connection
let C = new Cantabile("localhost:35007");

// The 'changed' event fires when the list of available documents changes
C.documents.on('changed', () => {
    console.log(`Documents: ${C.documents.documentList.join(", ")}`);
});

// This watches a particular document and will fire
// when a document's content changes (including when switching songs)
C.documents.watch("Main", (content) => {
    console.log(`Content changed: ${content}`);
});

// The content of a document can be fetched without watching
let content = await C.documents.getDocumentContent("Main");
console.log(`fetched: ${content}`);

// Update the content of an existing document
await sleep(1000);
await C.documents.setDocumentContent("Main", (content ?? "Main") + "X");

// Create a new document, then delete it
await sleep(1000);
await C.documents.setDocumentContent("testdoc", "test content");
await sleep(1000);
await C.documents.setDocumentContent("testdoc", null);

console.log("Monitoring for more changes...");

// Helper
function sleep(ms) { return new Promise((resolve) => setTimeout(resolve, ms)) };