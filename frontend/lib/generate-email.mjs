import { buildVerificationEmail } from "./verification-email.mjs";
import fs from "fs";

const htmlFR = buildVerificationEmail({ locale: "fr" }).html;
const htmlEN = buildVerificationEmail({ locale: "en" }).html;

fs.writeFileSync("../verification-email-fr.html", htmlFR);
fs.writeFileSync("../verification-email-en.html", htmlEN);

console.log("HTML files generated at frontend/verification-email-fr.html and frontend/verification-email-en.html");
