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
];

export const kbById = (id: string) => KB.find((k) => k.id === id);
