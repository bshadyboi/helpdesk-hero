import type { KbArticle } from "./types";

export const KB: KbArticle[] = [
  {
    id: "kb-verify-identity",
    title: "Always Verify Identity First",
    category: "Security",
    body: "Before making account changes, confirm the caller's identity: full name, employee ID, and a second factor (manager name, callback number, or MFA prompt). Never reset credentials on request alone — this is the #1 social-engineering vector.",
  },
  {
    id: "kb-password-reset",
    title: "Password Reset Procedure",
    category: "Accounts",
    body: "1) Verify identity. 2) Trigger a self-service reset link where possible. 3) If manual, set a temporary password and force change at next login. 4) Confirm MFA still works. 5) Log the reset in the ticket.",
  },
  {
    id: "kb-mfa",
    title: "MFA / Lost Authenticator",
    category: "Accounts",
    body: "If a user lost their MFA device: verify identity strongly, remove the old factor, issue temporary bypass codes, and require re-enrollment. Never disable MFA permanently.",
  },
  {
    id: "kb-network-triage",
    title: "Network Connectivity Triage",
    category: "Network",
    body: "Isolate the scope: one user or many? Wired or Wi-Fi? Check link lights, then ipconfig/ifconfig, ping the gateway, ping 8.8.8.8, then DNS (nslookup). Reboot the switch/router only after ruling out the client.",
  },
  {
    id: "kb-vpn",
    title: "VPN Won't Connect",
    category: "Network",
    body: "Confirm internet works first. Check credentials & MFA, client version, and whether the user is on a captive-portal Wi-Fi. Restart the VPN client, then try a different profile/region node.",
  },
  {
    id: "kb-printer",
    title: "Printer Troubleshooting",
    category: "Hardware",
    body: "Check power & paper/toner, then the print queue for stuck jobs. Restart the print spooler. Reinstall the driver if garbled output. Confirm the correct printer is selected and it's online (not paused).",
  },
  {
    id: "kb-slow-pc",
    title: "Slow Computer",
    category: "Hardware",
    body: "Check uptime (reboot if weeks old), disk space, and Task Manager for runaway processes. Look for pending updates and low RAM. Malware scan if behavior is sudden. Consider SSD/RAM upgrade for old hardware.",
  },
  {
    id: "kb-email-sync",
    title: "Email Not Syncing",
    category: "Email",
    body: "Verify credentials and that the mailbox isn't full. Check server status/outages. Recreate the profile or re-add the account. Confirm correct protocol (Exchange/IMAP) and that offline mode is off.",
  },
  {
    id: "kb-phishing",
    title: "Phishing / Suspicious Email",
    category: "Security",
    body: "Do NOT click links. Report to security via the Report Phishing button. Preserve headers. If the user already entered credentials, reset them immediately and force MFA re-auth. Notify the security team of scope.",
  },
  {
    id: "kb-malware",
    title: "Suspected Malware / Ransomware",
    category: "Security",
    body: "ISOLATE the device from the network immediately (unplug/disable Wi-Fi). Do not power off if ransomware (preserves forensics unless policy says otherwise). Escalate to the security team. Never pay demands from the desk.",
  },
  {
    id: "kb-software-install",
    title: "Software Install & Licensing",
    category: "Software",
    body: "Confirm the app is approved and licensed. Use the software portal/admin deployment rather than user downloads. Check system requirements and admin rights. Log the license assignment.",
  },
  {
    id: "kb-mobile-mdm",
    title: "Mobile Device / MDM",
    category: "Mobile",
    body: "Confirm the device is enrolled in MDM. For lost/stolen: locate, then remote-lock, then selective wipe of corporate data. Reissue email profile after re-enrollment.",
  },
  {
    id: "kb-tone",
    title: "De-escalation & Tone",
    category: "Accounts",
    body: "Acknowledge feelings, apologize for the impact (not necessarily fault), state what you'll do next, and give a timeframe. Never argue. A calm, specific plan lowers the temperature faster than technical detail.",
  },
  {
    id: "kb-app-cache",
    title: "App Won't Open / Misbehaving",
    category: "Software",
    body: "For a crashing or frozen desktop app: fully quit it (check Task Manager for leftover processes), then relaunch. If it still fails, sign out and back in, clear the app's local cache/config, and update to the latest version. A corrupt local cache is the #1 cause of a single app misbehaving while everything else works.",
  },
  {
    id: "kb-cloud-sync",
    title: "OneDrive / Cloud File Sync",
    category: "Software",
    body: "Check the sync client status icon: a red X means a conflict or sign-in issue, a spinning arrow means it's still uploading. Confirm the user is signed in, the account isn't over its storage quota, and no filename has illegal characters. If stuck, pause and resume sync, or reset the sync client. Files may be 'online-only' (Files On-Demand) rather than missing.",
  },
  {
    id: "kb-drive-map",
    title: "Mapped Network Drives",
    category: "Network",
    body: "Mapped drives commonly disconnect after a password change, a dropped VPN, or a server reboot. Confirm the user is on the network/VPN, then remap using their current credentials and the full server path (\\\\server\\share). Enable 'reconnect at logon' so it survives restarts. If one user is fine and another isn't, suspect permissions, not the server.",
  },
  {
    id: "kb-cert-warning",
    title: "Certificate / HTTPS Warnings",
    category: "Network",
    body: "A browser certificate warning can mean an expired certificate, a wrong system clock, or a genuine man-in-the-middle attack. Check the certificate details (who issued it, expiry) and the device's date/time before doing anything. Never coach users to routinely click through security warnings — investigate why it appeared and fix the root cause.",
  },
  {
    id: "kb-power",
    title: "Laptop Won't Charge",
    category: "Hardware",
    body: "Confirm the charger LED and that the cable is firmly seated at both ends. Try a different wall outlet and, for USB-C, a different port (some ports are data-only). Inspect the cable and port for damage or debris. Test with a known-good charger before declaring the battery or board dead. A hard reset / drained battery may need 15+ minutes on power before it responds.",
  },
  {
    id: "kb-patching",
    title: "Updates & Patch Management",
    category: "Software",
    body: "Deploy patches through the management tool, not ad-hoc. Test first, schedule outside working hours where possible, and warn users before forced reboots so they save work. Always have a rollback plan. Never disable security updates to make an annoyance go away — reschedule them instead.",
  },
  {
    id: "kb-suspicious-login",
    title: "Suspicious / Impossible-Travel Sign-in",
    category: "Security",
    body: "An 'impossible travel' or unfamiliar sign-in alert (two logins from distant locations too close in time) suggests stolen credentials. Verify with the user out-of-band whether it was them. If not: reset the password, revoke all active sessions/tokens, re-enforce MFA, and check for attacker-created inbox rules or forwarding. Then report to security.",
  },
  {
    id: "kb-mfa-fatigue",
    title: "MFA Fatigue / Push Bombing",
    category: "Security",
    body: "Repeated unexpected MFA approval prompts mean an attacker already has the password and is spamming the user hoping they tap 'Approve' out of annoyance. Tell the user to DENY every prompt and report it. Immediately reset the password, revoke sessions, and switch the account to number-matching MFA. Approving even once can hand over the account.",
  },
  {
    id: "kb-bitlocker",
    title: "Disk Encryption Recovery Key",
    category: "Security",
    body: "If a device boots to a BitLocker/FileVault recovery screen, the encryption key is stored in the directory or MDM tied to that specific device — not with the user. Verify identity, then look up the recovery key by the device ID. Never store or email recovery keys in plaintext. After recovery, find out what triggered it (firmware change, failed update) so it doesn't repeat.",
  },
  {
    id: "kb-bec",
    title: "Business Email Compromise / CEO Fraud",
    category: "Security",
    body: "BEC scams impersonate an executive or vendor to rush someone into wiring money, buying gift cards, or changing bank details. Red flags: urgency, secrecy, a look-alike domain, or a 'reply-to' that differs from the sender. NEVER act on the email alone — verify the request out-of-band using a known phone number, and loop in security/finance before any money moves.",
  },
  {
    id: "kb-major-incident",
    title: "Major Incident Management",
    category: "Network",
    body: "When something is broadly down (email, a core system, a whole site), declare a major incident. Assign an incident commander, open a communication bridge, and post regular status updates with an ETA — even 'still investigating' reassures users. Track a timeline for the post-incident review. Don't let everyone freelance fixes; coordinate.",
  },
];

export const kbById = (id: string) => KB.find((k) => k.id === id);
