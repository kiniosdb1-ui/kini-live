import crypto from "node:crypto";
import { hashAdminPassword } from "../src/lib/adminSecurity.js";

const password = [
  crypto.randomBytes(6).toString("base64url"),
  crypto.randomBytes(6).toString("base64url"),
  crypto.randomBytes(4).toString("hex"),
].join("-");

console.log("Generated admin password (store it securely):");
console.log(password);
console.log("\nADMIN_PASSWORD_HASH=");
console.log(hashAdminPassword(password));
