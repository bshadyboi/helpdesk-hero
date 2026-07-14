/**
 * One-line "key takeaway" for each scenario, shown in the post-ticket debrief.
 * Written to reinforce the transferable, real-world help desk skill — not just
 * the steps of that specific ticket.
 */
export const LESSONS: Record<string, string> = {
  // ----- Difficulty 1 -----
  "pw-reset-basic":
    "Verify identity before ANY account change, use self-service or forced-change temp passwords, and confirm MFA before closing.",
  "printer-basic":
    "Troubleshoot before replacing hardware — a stuck print queue plus a spooler restart fixes most 'won't print' tickets.",
  "monitor-dead":
    "Check cables, inputs, and display detection before condemning a monitor. Blind reboots aren't a diagnosis.",
  "keyboard-dead":
    "Dead input devices are almost always power or connection — swap batteries and reseat the receiver before anything drastic.",
  "screen-zoom":
    "A sudden 'everything is huge/blurry' after an update is a resolution/scaling reset — fix the setting, not the hardware.",

  // ----- Difficulty 2 -----
  "wifi-drop":
    "Scope one-user vs. many before touching shared gear, and confirm intermittent issues stay fixed before closing.",
  "email-sync":
    "Match the fix to the symptom, never assign blame, and treat a rule/forward the user didn't create as possible account compromise.",
  "2fa-new-phone":
    "Never disable MFA to solve a lockout — verify identity, remove the old factor, issue bypass codes, and re-enroll.",
  "meeting-no-audio":
    "During a live call, check the app's input/output device first; rebooting drops the call and rarely helps.",
  "teams-crash":
    "When one app fails but the system is fine, fix the app: kill stray processes and clear its cache — don't reinstall the OS.",
  "onedrive-sync":
    "A sync error rarely means lost data — read the actual error (often an illegal filename) instead of deleting local files.",
  "password-expiry":
    "Remote logins use cached credentials — connect the VPN before/at login so a new password syncs to the laptop.",

  // ----- Difficulty 3 -----
  "vpn-exec":
    "Under executive pressure, project calm and pick the fastest likely fix first (a missed MFA prompt beats a reinstall).",
  "slow-laptop":
    "Diagnose before promising hardware; full disks and long uptime cause slowness — and never defrag an SSD.",
  "software-license":
    "Deploy licensed software from the company portal signed in with the work account — never suggest pirated or personal copies.",
  "saas-outage":
    "When many users fail on a SaaS tool at once, check the vendor status page before mass-reinstalling anything.",
  "calendar-invites":
    "Chase the root cause (delegate permissions / mail rules) instead of repeatedly resending or rebuilding accounts.",
  "docking-station":
    "After a desk move, suspect power and reseated cables first; then firmware/driver updates and display-detect.",
  "shared-mailbox":
    "Sensitive shared resources need manager approval and least-privilege roles — grant the minimum, not ownership.",
  "mapped-drive":
    "If others can reach a share and one user can't, it's their mapping — remap with current credentials, not a server restore.",
  "cert-warning":
    "Never train users to click through certificate warnings — check the cert and the system clock to find the real cause.",
  "laptop-charge":
    "No light on the charger points to the charger, not the battery — test a known-good charger before condemning the laptop.",
  "patch-reboot":
    "Never disable security updates to stop reboots — configure active hours and restart warnings so the user stays in control.",

  // ----- Difficulty 4 -----
  "phishing-report":
    "Never shame a reporter. On stolen credentials: reset the password and revoke sessions NOW, then report the campaign.",
  "network-outage":
    "Many users failing together means shared infrastructure — plus communication and a workaround matter as much as the fix.",
  "mobile-lost":
    "Protect corporate data first with an MDM lock; prefer a selective (corporate-only) wipe and rotate the user's credentials.",
  "social-engineering":
    "Urgency + authority + 'skip verification' is the social-engineering combo — hold firm on identity checks no matter the threats.",
  "data-recovery":
    "Cloud storage has version history and a second-stage recycle bin — never give up (or ask users to rebuild) before checking.",
  "impossible-travel":
    "Treat impossible-travel on a sensitive account as compromise: reset, revoke sessions, audit inbox rules, then report.",
  "mfa-fatigue":
    "Repeated 'approve?' prompts mean the attacker already has the password — always deny, then reset and enable number-matching.",
  "bitlocker-lock":
    "Encryption recovery keys live in your directory/MDM by device — verify identity and look it up; never wipe recoverable data.",

  // ----- Difficulty 5 -----
  "ransomware":
    "Isolate from the network FIRST to stop the spread, never advise paying, and escalate to incident response immediately.",
  "onboarding-day":
    "Own the problem instead of ping-ponging the user, and provision role-appropriate access under pressure — not blanket admin.",
  "angry-vip-repeat":
    "With repeat callers, own the org's failure, fix the tool (not the user), and commit to a concrete follow-up.",
  "offboarding":
    "Disable (don't delete) to preserve data, revoke sessions and wipe devices — a password change alone won't cut active access.",
  "bec-wire":
    "Urgency + secrecy + a new bank account is CEO-fraud — verify out-of-band on a known number before any money moves.",
  "email-outage":
    "Declare a major incident, communicate a status/ETA relentlessly, and follow up with a post-incident review and monitoring.",

  // ----- On-call -----
  "backup-fail-3am":
    "On-call backup failures: read the error class first — expired service-account certs cause most auth failures; fix creds, verify, document.",
  "exec-lockout-late":
    "After-hours VIP lockouts still require verification; use callback numbers and time-limited MFA bypass — never disable MFA.",
  "ransomware-page":
    "Ransomware on-call: isolate the host first, preserve evidence, rotate compromised credentials — never reboot or allow shadow IT workarounds.",
  "dc-ups-alarm":
    "Datacenter power events need immediate escalation and tiered graceful shutdown — controlled beats a hard crash every time.",
};

export const lessonFor = (scenarioId: string): string | undefined => LESSONS[scenarioId];
