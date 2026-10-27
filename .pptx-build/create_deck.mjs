import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const ROOT = "C:/Users/HRIDAY/Desktop/blockchain";
const BUILD = path.join(ROOT, ".pptx-build");
const FINAL = path.join(ROOT, "output/presentations/proofcase_digital_evidence_vault.pptx");
const SKILL = "C:/Users/HRIDAY/.codex/plugins/cache/openai-primary-runtime/presentations/26.1025.11240/skills/presentations";
const W = 1280;
const H = 720;
const FONT = "Arial";
const C = {
  ink: "#101D26", ink2: "#182B36", ink3: "#203944", paper: "#F5F3EC",
  white: "#FFFFFF", text: "#18242B", muted: "#66757D", line: "#D7DCD8",
  teal: "#25C4A8", tealPale: "#DDF4EE", lime: "#D8F06B", orange: "#E68A58",
  mist: "#EAEDE8", gray2: "#A9B3B3", shadow: "#31434B",
};

const presentation = Presentation.create({ slideSize: { width: W, height: H } });

function rect(slide, x, y, w, h, fill, opts = {}) {
  const shape = slide.shapes.add({
    geometry: opts.geometry || "rect",
    name: opts.name,
    position: { left: x, top: y, width: w, height: h },
    fill: fill || "none",
    line: { style: "solid", fill: opts.line || "none", width: opts.line ? (opts.lineWidth || 1) : 0 },
    ...(opts.radius ? { borderRadius: opts.radius } : {}),
  });
  return shape;
}

function text(slide, x, y, w, h, value, opts = {}) {
  const shape = slide.shapes.add({
    geometry: "textbox",
    name: opts.name,
    position: { left: x, top: y, width: w, height: h },
    fill: "none",
    line: { style: "solid", fill: "none", width: 0 },
  });
  shape.text = value;
  shape.text.style = {
    typeface: opts.font || FONT,
    fontSize: opts.size || 22,
    color: opts.color || C.text,
    bold: Boolean(opts.bold),
    alignment: opts.align || "left",
    verticalAlignment: opts.valign || "top",
    autoFit: "shrinkText",
    wrap: "square",
    insets: 0,
    ...(opts.lineSpacing ? { lineSpacing: opts.lineSpacing } : {}),
  };
  return shape;
}

function line(slide, x, y, w, h, color = C.line) {
  return rect(slide, x, y, w, h, color);
}

function bg(slide, color = C.paper) { slide.background.fill = color; }

function footer(slide, n, dark = false) {
  const color = dark ? "#91A1A6" : "#78858A";
  text(slide, 80, 682, 460, 18, "PROOFCASE  /  DIGITAL EVIDENCE VAULT", { size: 12, color, bold: true });
  text(slide, 1120, 682, 80, 18, `${String(n).padStart(2, "0")} / 10`, { size: 12, color, align: "right" });
}

function heading(slide, title, subtitle = "", dark = false) {
  text(slide, 80, 67, 1110, 58, title, { size: 43, color: dark ? C.white : C.ink, bold: true });
  if (subtitle) text(slide, 82, 132, 1040, 44, subtitle, { size: 21, color: dark ? "#BBC9CA" : C.muted });
}

function note(slide, body) { slide.speakerNotes.text = body; }

// 1. Cover
{
  const s = presentation.slides.add(); bg(s, C.ink);
  rect(s, 80, 77, 42, 5, C.teal);
  text(s, 80, 105, 645, 190, "Blockchain-Based\nDigital Evidence Vault", { size: 52, color: C.white, bold: true });
  text(s, 84, 330, 570, 84, "A Next.js MVP for evidence intake,\nintegrity checks, and custody review.", { size: 25, color: "#C2CDCD" });
  text(s, 84, 597, 510, 26, "PROJECT OVERVIEW  /  10 SLIDES", { size: 14, color: C.teal, bold: true });

  // Editable concept diagram: the file, its fingerprint, then its event history.
  const centers = [785, 950, 1115];
  const labels = [["FILE", "evidence"], ["HASH", "fingerprint"], ["TRAIL", "custody"]];
  line(s, 809, 309, 282, 3, "#42616A");
  centers.forEach((cx, i) => {
    rect(s, cx - 46, 263, 92, 92, i === 1 ? C.teal : C.ink3, { geometry: "ellipse", name: `cover-node-${i + 1}` });
    text(s, cx - 40, 291, 80, 24, labels[i][0], { size: 17, color: i === 1 ? C.ink : C.white, bold: true, align: "center" });
    text(s, cx - 75, 382, 150, 32, labels[i][1], { size: 17, color: "#B7C4C5", align: "center" });
  });
  text(s, 773, 500, 390, 53, "Local prototype today.\nBlockchain anchoring is a future step.", { size: 19, color: "#E8EEEC", align: "center" });
  footer(s, 1, true);
  note(s, "Introduce the project as it exists today: a Next.js evidence-management MVP. It creates browser-local SHA-256 fingerprints and a hash-linked custody sequence. It does not write to a blockchain network.");
}

// 2. Problem
{
  const s = presentation.slides.add(); bg(s, C.paper);
  heading(s, "Evidence needs a reliable history", "A file is useful only when its identity and handling context stay with it.");
  const cols = [
    { x: 82, key: "01 / IDENTITY", title: "Which file?", body: "Names can be changed. A cryptographic fingerprint gives the file contents a repeatable identifier." },
    { x: 465, key: "02 / INTEGRITY", title: "Has it changed?", body: "Without a trusted reference, a later copy is difficult to compare with the one first collected." },
    { x: 848, key: "03 / HISTORY", title: "Who handled it?", body: "The case needs a time-ordered account of intake and later evidence actions." },
  ];
  cols.forEach((c, i) => {
    text(s, c.x, 235, 310, 24, c.key, { size: 14, color: C.muted, bold: true });
    text(s, c.x, 272, 310, 48, c.title, { size: 29, color: C.ink, bold: true });
    text(s, c.x, 337, 305, 118, c.body, { size: 21, color: C.text });
    if (i < 2) line(s, c.x + 340, 235, 1, 245, C.line);
  });
  line(s, 82, 525, 1115, 1, C.line);
  text(s, 82, 552, 1080, 68, "The vault connects the file, its fingerprint, its case, and its custody record.", { size: 26, color: C.ink, bold: true });
  footer(s, 2);
  note(s, "Frame the problem around three questions that investigators need to answer: which exact file was collected, whether its contents still match, and what handling actions were recorded. The MVP addresses these questions at a prototype level.");
}

// 3. Product model
{
  const s = presentation.slides.add(); bg(s, C.white);
  heading(s, "The MVP connects a file to its history", "An evidence record brings together the item, its fingerprint, and its custody events.");
  const startX = 92, y = 270, boxW = 222, gap = 62;
  const steps = [
    { n: "01", title: "Evidence file", desc: "Original bytes\nplus case details", fill: C.ink, fg: C.white },
    { n: "02", title: "SHA-256", desc: "Fingerprint\nfor those bytes", fill: C.tealPale, fg: C.ink },
    { n: "03", title: "Evidence record", desc: "ID, category,\nowner, date, status", fill: C.paper, fg: C.ink },
    { n: "04", title: "Custody events", desc: "Ordered actions\nlinked by hashes", fill: C.ink, fg: C.white },
  ];
  steps.forEach((step, i) => {
    const x = startX + i * (boxW + gap);
    rect(s, x, y, boxW, 170, step.fill, { radius: 6, name: `model-step-${i + 1}` });
    text(s, x + 18, y + 18, 50, 25, step.n, { size: 15, color: step.fg === C.white ? C.teal : C.muted, bold: true });
    text(s, x + 18, y + 58, boxW - 32, 36, step.title, { size: 22, color: step.fg, bold: true });
    text(s, x + 18, y + 105, boxW - 32, 55, step.desc, { size: 18, color: step.fg === C.white ? "#C6D0D1" : C.muted });
    if (i < 3) {
      rect(s, x + boxW + 9, y + 77, gap - 18, 12, C.teal, { geometry: "rightArrow" });
    }
  });
  text(s, 92, 505, 1085, 68, "Today, the browser stores both the uploaded file and its record. No blockchain transaction is made.", { size: 21, color: C.muted });
  footer(s, 3);
  note(s, "Walk through the product model from left to right. A file upload is associated with case details; the file is fingerprinted; a record stores its metadata; custody events form the history. The storage and hash sequence are local to the browser in this MVP.");
}

// 4. Upload flow
{
  const s = presentation.slides.add(); bg(s, C.paper);
  heading(s, "Evidence intake", "Adding an item starts a record that can be searched and reviewed.");
  line(s, 124, 226, 3, 352, "#B7C6C2");
  const rows = [
    { y: 214, num: "1", title: "Select the file", desc: "Choose a file from the device. The MVP saves its contents in browser storage." },
    { y: 310, num: "2", title: "Describe the evidence", desc: "Enter a case ID and choose a category such as document, image, video, or log file." },
    { y: 406, num: "3", title: "Create a fingerprint", desc: "The browser reads the file bytes and calculates a SHA-256 digest." },
    { y: 502, num: "4", title: "Save the custody record", desc: "The app records intake, hash verification, and sealing events for the item." },
  ];
  rows.forEach((r, i) => {
    rect(s, 102, r.y, 48, 48, i === 2 ? C.teal : C.ink, { geometry: "ellipse" });
    text(s, 102, r.y + 11, 48, 25, r.num, { size: 19, color: i === 2 ? C.ink : C.white, bold: true, align: "center" });
    text(s, 188, r.y - 1, 350, 32, r.title, { size: 24, color: C.ink, bold: true });
    text(s, 188, r.y + 36, 880, 48, r.desc, { size: 19, color: C.muted });
  });
  footer(s, 4);
  note(s, "Describe the upload interaction shown in the MVP. New evidence is saved locally, and a SHA-256 digest is generated in the browser. The custody entries are created by the application; the current prototype does not capture a cryptographic identity for the actor.");
}

// 5. Hashes
{
  const s = presentation.slides.add(); bg(s, C.ink);
  heading(s, "Two hashes serve different checks", "The file hash identifies bytes; the event hash links one custody entry to the next.", true);
  text(s, 84, 220, 235, 35, "FILE FINGERPRINT", { size: 15, color: C.teal, bold: true });
  text(s, 84, 264, 235, 73, "File bytes", { size: 29, color: C.white, bold: true });
  text(s, 84, 324, 235, 42, "Any supported file", { size: 17, color: "#AABABB" });
  line(s, 325, 298, 85, 3, "#47616A");
  text(s, 424, 265, 165, 70, "SHA-256", { size: 26, color: C.white, bold: true, align: "center" });
  line(s, 600, 298, 80, 3, "#47616A");
  rect(s, 699, 250, 430, 108, C.ink3, { radius: 5 });
  text(s, 724, 269, 365, 32, "File fingerprint", { size: 24, color: C.lime, bold: true });
  text(s, 724, 311, 365, 28, "A digest to compare the file against later", { size: 16, color: "#C1CCCC" });

  line(s, 84, 392, 1080, 1, "#334B55");
  text(s, 84, 420, 235, 35, "CUSTODY EVENT HASH", { size: 15, color: C.teal, bold: true });
  text(s, 84, 462, 265, 75, "Event + previous hash", { size: 25, color: C.white, bold: true });
  text(s, 84, 527, 255, 37, "Action, actor, time, evidence digest", { size: 16, color: "#AABABB" });
  line(s, 358, 486, 55, 3, "#47616A");
  text(s, 421, 457, 165, 70, "SHA-256", { size: 26, color: C.white, bold: true, align: "center" });
  line(s, 600, 486, 80, 3, "#47616A");
  rect(s, 699, 438, 430, 108, C.ink3, { radius: 5 });
  text(s, 724, 457, 365, 32, "Next event hash", { size: 24, color: C.lime, bold: true });
  text(s, 724, 499, 365, 31, "Changing an earlier link breaks the sequence", { size: 16, color: "#C1CCCC" });
  text(s, 84, 590, 1050, 35, "A matching hash compares bytes. It does not prove who collected them or whether the process was lawful.", { size: 17, color: "#E0E8E7" });
  footer(s, 5, true);
  note(s, "Clarify the distinction. The evidence fingerprint is calculated from file bytes. A custody-event hash includes the prior event hash and evidence digest. Together they allow a later comparison against the stored reference data, but a hash alone cannot establish provenance or collection conditions.");
}

// 6. Chain of custody
{
  const s = presentation.slides.add(); bg(s, C.white);
  heading(s, "Custody events form a linked sequence", "Each new event points back to the previous event hash.");
  const xPositions = [95, 455, 815];
  const names = ["01  INTAKE", "02  HASH CHECK", "03  SEALED"];
  const prevs = ["Previous: GENESIS", "Previous: event 01 hash", "Previous: event 02 hash"];
  const hashLabels = ["Event hash: H1", "Event hash: H2", "Event hash: H3"];
  for (let i = 0; i < 3; i++) {
    const x = xPositions[i];
    rect(s, x, 255, 285, 165, i === 1 ? C.tealPale : C.paper, { radius: 5, line: C.line, name: `custody-event-${i + 1}` });
    text(s, x + 20, 276, 245, 25, names[i], { size: 15, color: C.muted, bold: true });
    text(s, x + 20, 318, 245, 28, prevs[i], { size: 18, color: C.ink });
    line(s, x + 20, 361, 245, 1, C.line);
    text(s, x + 20, 377, 245, 24, hashLabels[i], { size: 18, color: C.ink, bold: true });
    if (i < 2) line(s, x + 285, 337, 75, 3, C.teal);
  }
  text(s, 95, 470, 1040, 34, "An event records an action, actor label, timestamp, description, evidence hash, previous hash, and current hash.", { size: 20, color: C.text });
  text(s, 95, 529, 1030, 60, "In this MVP, the sequence is stored in browser data. A person who can edit that data can also replace the hashes, so the record is tamper-evident only when compared with a separately protected reference.", { size: 18, color: C.muted });
  footer(s, 6);
  note(s, "The three boxes show the local event sequence used for new uploads. Explain that the second event uses the first event hash as its previous value, and the third uses the second. The browser stores the events, so the local copy is not an independently protected blockchain ledger.");
}

// 7. Evidence record
{
  const s = presentation.slides.add(); bg(s, C.paper);
  heading(s, "What an evidence record contains", "The record keeps case context beside the file fingerprint and custody trail.");
  rect(s, 82, 218, 590, 365, C.ink, { radius: 5, name: "record-schema" });
  text(s, 108, 241, 530, 24, "EVIDENCE RECORD  /  SCHEMA", { size: 14, color: C.teal, bold: true });
  text(s, 108, 283, 530, 265,
    "id: evidence identifier\nname: original filename\nkind: file extension\ncategory: evidence type\nsize: file size in bytes\nhash: SHA-256 fingerprint\nadded: intake date and time\nowner: uploader label\nstatus: Verified or Pending\ncaseId: investigation identifier\ncustody: ordered event list",
    { size: 18, color: "#EFF4F1", font: "Consolas" });
  text(s, 730, 226, 425, 33, "Two layers of information", { size: 25, color: C.ink, bold: true });
  text(s, 730, 282, 390, 25, "EVIDENCE METADATA", { size: 14, color: C.muted, bold: true });
  text(s, 730, 314, 430, 71, "Name, case, category, size, uploader, date, and verification status make items easier to find and review.", { size: 19, color: C.text });
  line(s, 730, 405, 390, 1, C.line);
  text(s, 730, 431, 390, 25, "CUSTODY HISTORY", { size: 14, color: C.muted, bold: true });
  text(s, 730, 463, 430, 91, "Actions, actor labels, timestamps, and linked hashes show how the item was handled in the local record.", { size: 19, color: C.text });
  footer(s, 7);
  note(s, "The fields correspond to the evidence record shape used in the MVP. The object has metadata and an ordered custody array. The schema view is explanatory; the slide does not show an actual user's case data.");
}

// 8. Architecture
{
  const s = presentation.slides.add(); bg(s, C.white);
  heading(s, "The current architecture stays in the browser", "The MVP has no application server, shared database, or blockchain connection.");
  rect(s, 82, 212, 770, 365, C.paper, { radius: 5, line: C.line, name: "browser-boundary" });
  text(s, 108, 232, 310, 25, "USER'S BROWSER  /  CURRENT MVP", { size: 14, color: C.muted, bold: true });
  rect(s, 108, 280, 714, 74, C.ink, { radius: 4 });
  text(s, 132, 296, 670, 34, "Next.js + React interface", { size: 25, color: C.white, bold: true });
  text(s, 132, 330, 660, 24, "Dashboard, upload form, evidence detail, search and filters", { size: 16, color: "#C4D0D0" });
  const xs = [108, 352, 596];
  const labels = [
    ["Web Crypto", "SHA-256 fingerprints\nand event hashes"],
    ["IndexedDB", "Uploaded file\ncontents"],
    ["LocalStorage", "Evidence records\nand custody events"],
  ];
  xs.forEach((x, i) => {
    rect(s, x, 400, 220, 126, i === 0 ? C.tealPale : C.white, { radius: 4, line: C.line });
    text(s, x + 16, 419, 190, 28, labels[i][0], { size: 21, color: C.ink, bold: true });
    text(s, x + 16, 458, 190, 52, labels[i][1], { size: 17, color: C.muted });
  });
  text(s, 905, 235, 265, 25, "NOT IMPLEMENTED", { size: 14, color: C.orange, bold: true });
  text(s, 905, 281, 285, 58, "Backend services", { size: 24, color: C.ink, bold: true });
  text(s, 905, 322, 270, 54, "Identity, shared cases, secure storage, durable audit", { size: 18, color: C.muted });
  line(s, 905, 402, 270, 1, C.line);
  text(s, 905, 431, 285, 37, "Blockchain network", { size: 24, color: C.ink, bold: true });
  text(s, 905, 473, 270, 64, "No transaction or on-chain evidence hash is created today.", { size: 18, color: C.muted });
  footer(s, 8);
  note(s, "Describe the actual MVP architecture: a Next.js and React interface, browser Web Crypto for hashes, IndexedDB for file blobs, and LocalStorage for records. The two right-side components are not implemented; they identify what would need to be added for a production system.");
}

// 9. Trust boundary
{
  const s = presentation.slides.add(); bg(s, C.ink);
  heading(s, "A local hash chain is not a blockchain", "The prototype demonstrates verification logic, not a production trust model.", true);
  text(s, 84, 218, 465, 26, "MVP TODAY", { size: 15, color: C.teal, bold: true });
  text(s, 84, 263, 465, 37, "What it can show", { size: 27, color: C.white, bold: true });
  text(s, 84, 318, 465, 200,
    "SHA-256 fingerprints for uploaded files\n\nA visible sequence of custody events\n\nChecks against data stored in this browser\n\nA clear message when a sample file is unavailable",
    { size: 19, color: "#D1DCDB" });
  line(s, 635, 218, 1, 354, "#3C555E");
  text(s, 700, 218, 465, 26, "FOR PRODUCTION", { size: 15, color: C.lime, bold: true });
  text(s, 700, 263, 465, 37, "What must be added", { size: 27, color: C.white, bold: true });
  text(s, 700, 318, 465, 220,
    "Authenticated users and case permissions\n\nEncrypted, durable evidence storage\n\nIndependently protected audit records\n\nOptional blockchain anchoring of selected hashes",
    { size: 19, color: "#D1DCDB" });
  rect(s, 84, 573, 1080, 54, C.ink3, { radius: 4 });
  text(s, 104, 588, 1040, 30, "A hash match checks file bytes against a reference. It does not prove collection, identity, or lawful handling.", { size: 17, color: C.white });
  footer(s, 9, true);
  note(s, "Be precise about the trust boundary. The local hash chain is useful to demonstrate the mechanics but it can be edited along with browser data. A production blockchain anchor could help protect a published commitment, but it would not independently prove how the evidence was collected or handled before submission.");
}

// 10. Roadmap
{
  const s = presentation.slides.add(); bg(s, C.paper);
  heading(s, "A practical path to a production vault", "Build the evidence controls first. Anchor only protected records.");
  const x = [86, 462, 838];
  const phases = [
    { n: "01", title: "Secure the workflow", body: "Add authentication and case roles. Move evidence and metadata into encrypted, durable storage." },
    { n: "02", title: "Protect the audit trail", body: "Add an append-only audit service, backups, retention rules, and exportable verification reports." },
    { n: "03", title: "Anchor selected hashes", body: "Choose a network and publish evidence commitments with transaction receipts and independent checks." },
  ];
  phases.forEach((p, i) => {
    text(s, x[i], 232, 80, 64, p.n, { size: 47, color: i === 2 ? C.teal : C.ink, bold: true });
    text(s, x[i], 316, 300, 58, p.title, { size: 23, color: C.ink, bold: true });
    text(s, x[i], 387, 300, 126, p.body, { size: 19, color: C.muted });
    if (i < 2) line(s, x[i] + 320, 254, 56, 2, C.line);
  });
  line(s, 85, 553, 1080, 1, C.line);
  text(s, 85, 578, 1080, 44, "The current deliverable is the first workflow prototype, not the completed production system.", { size: 22, color: C.ink, bold: true });
  footer(s, 10);
  note(s, "Close with a staged development path. First establish identity and secure storage. Then protect and export the audit history. Only after those controls exist should the project decide whether blockchain anchoring is useful, and which hashes are appropriate to publish.");
}

async function saveBlob(filePath, blob) {
  await fs.writeFile(filePath, new Uint8Array(await blob.arrayBuffer()));
}

await fs.mkdir(path.join(BUILD, "rendered"), { recursive: true });
for (let i = 0; i < presentation.slides.items.length; i++) {
  const slide = presentation.slides.items[i];
  await saveBlob(path.join(BUILD, "rendered", `slide-${String(i + 1).padStart(2, "0")}.png`), await presentation.export({ slide, format: "png", scale: 1 }));
}
await saveBlob(path.join(BUILD, "montage.webp"), await presentation.export({ format: "webp", montage: true, scale: 0.5 }));
const draft = await PresentationFile.exportPptx(presentation);
const draftPath = path.join(BUILD, "proofcase_digital_evidence_vault_draft.pptx");
await draft.save(draftPath);

const { finalizePresentation } = await import(pathToFileURL(path.join(SKILL, "container_tools/artifact_tool_utils.mjs")).href);
const result = await finalizePresentation({
  explicitTotalSlideCount: 10,
  requiredNativeTableOwnerSlides: [],
  requiredNativeChartOwnerSlides: [],
  workspaceDir: ROOT,
  candidatePath: draftPath,
  finalPath: FINAL,
  pythonExecutable: "C:/Users/HRIDAY/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe",
  integrityValidatorPath: path.join(SKILL, "container_tools/inspect_presentation_package_integrity.py"),
  layoutValidatorPath: path.join(SKILL, "container_tools/inspect_presentation_layout_geometry.py"),
  layoutArgs: ["--expected-slide-size-emu", "12192000,6858000", "--validate-heading-fit"],
  fontPolicy: { basis: "design", families: [FONT, "Consolas"] },
  verifyArtifactToolImport: true,
  receiptPath: path.join(BUILD, "proofcase_digital_evidence_vault.validation-final.json"),
});
console.log(JSON.stringify({ draftPath, finalPath: FINAL, slides: presentation.slides.items.length, finalization: result }, null, 2));
