/**
 * Certification exams — short multiple-choice quizzes that test the concepts
 * taught by the tickets and knowledge base. Passing awards XP and the
 * "Certified" badge, and is a natural "zero to pro" milestone.
 */
export interface ExamQuestion {
  id: string;
  q: string;
  options: string[];
  /** index into options */
  answer: number;
  explain: string;
}

export interface Exam {
  id: number;
  title: string;
  icon: string;
  blurb: string;
  /** percentage of correct answers required to pass */
  passPct: number;
  questions: ExamQuestion[];
}

export const EXAMS: Exam[] = [
  {
    id: 1,
    title: "Help Desk Fundamentals",
    icon: "🎓",
    blurb: "The basics every new agent must know before touching a ticket.",
    passPct: 80,
    questions: [
      {
        id: "f1",
        q: "A caller says they're locked out and need a password reset urgently. What do you do FIRST?",
        options: [
          "Reset the password immediately so they aren't blocked",
          "Verify their identity before making any account change",
          "Tell them password policy requires a 90-day change",
          "Ask them to email you the old password",
        ],
        answer: 1,
        explain: "Identity verification always comes first — resetting on request alone is the #1 social-engineering risk.",
      },
      {
        id: "f2",
        q: "A printer says 'ready' but nothing prints. What's the most likely fix?",
        options: [
          "Order a replacement printer",
          "Have the user keep clicking print",
          "Clear the stuck print queue and restart the spooler",
          "Reinstall the operating system",
        ],
        answer: 2,
        explain: "Stuck queues are the usual culprit — clear the queue and restart the print spooler before replacing hardware.",
      },
      {
        id: "f3",
        q: "A remote user changed their password on the web portal but their laptop still rejects it. Why?",
        options: [
          "The portal is broken",
          "The laptop uses cached credentials until it reaches the company network (VPN)",
          "They need a brand-new laptop",
          "MFA must be disabled",
        ],
        answer: 1,
        explain: "Off-network laptops trust the old cached password until they sync over VPN — connect first, then the new password works.",
      },
      {
        id: "f4",
        q: "Only one app won't open, but everything else on the PC works. Best first step?",
        options: [
          "Reinstall Windows",
          "Fully quit the app (kill stray processes) and clear its cache",
          "Replace the laptop",
          "Tell the user to wait it out",
        ],
        answer: 1,
        explain: "When a single app misbehaves, a corrupt local cache is the usual cause — restart it and clear the cache.",
      },
      {
        id: "f5",
        q: "An external monitor shows 'No Signal'. What should you check before condemning it?",
        options: [
          "Nothing — order a new monitor",
          "Cable seating, input source, and display detection",
          "Reinstall the OS",
          "Defragment the hard drive",
        ],
        answer: 1,
        explain: "Check cables, the input source, and use display-detect before assuming the hardware is dead.",
      },
    ],
  },
  {
    id: 2,
    title: "Support Technician Certification",
    icon: "🛠️",
    blurb: "Triage, root-cause thinking, and access done right.",
    passPct: 80,
    questions: [
      {
        id: "t1",
        q: "A whole 12-person team suddenly gets errors in a cloud CRM. What do you check first?",
        options: [
          "Reinstall the app on all 12 machines",
          "The vendor's status page for a provider-side outage",
          "Each person's internet router",
          "Their keyboards",
        ],
        answer: 1,
        explain: "When many users fail at once on a SaaS tool, suspect a vendor outage — check the status page before mass actions.",
      },
      {
        id: "t2",
        q: "A user's laptop is slow: 98% full disk, 3 weeks uptime. What do you do?",
        options: [
          "Defragment the SSD daily",
          "Reboot, free disk space, and check for runaway processes",
          "Immediately issue a new laptop",
          "Nothing, it's normal",
        ],
        answer: 1,
        explain: "Full disks and long uptime cause slowness. Reboot and free space — and never defrag an SSD.",
      },
      {
        id: "t3",
        q: "A new team member requests access to a shared billing mailbox. Correct approach?",
        options: [
          "Grant full owner rights immediately",
          "Require manager approval, then grant the least-privilege role needed",
          "Deny it outright",
          "Give them admin over all mailboxes",
        ],
        answer: 1,
        explain: "Sensitive shared resources need approval and least privilege — grant the minimum role, not ownership.",
      },
      {
        id: "t4",
        q: "One user's mapped S: drive shows a red X; teammates can open it fine. Most likely cause?",
        options: [
          "The file server crashed",
          "That user's drive mapping is stale — remap it",
          "The files were deleted",
          "A full server restore is needed",
        ],
        answer: 1,
        explain: "If others can reach the share, the data is fine — it's that user's stale mapping. Remap with current credentials.",
      },
      {
        id: "t5",
        q: "A browser shows 'Your connection is not private' on the intranet. What should you NOT do?",
        options: [
          "Check the certificate details",
          "Check the system clock",
          "Train the user to always click 'proceed anyway'",
          "Investigate why the warning appeared",
        ],
        answer: 2,
        explain: "Never train users to click through cert warnings — that's how MITM attacks succeed. Find the real cause.",
      },
    ],
  },
  {
    id: 3,
    title: "Security Response Certification",
    icon: "🛡️",
    blurb: "Incidents, compromised accounts, and staying calm under fire.",
    passPct: 80,
    questions: [
      {
        id: "s1",
        q: "Files are turning into '.locked' and a ransom note appeared, spreading to a share. FIRST action?",
        options: [
          "Pay the ransom quickly",
          "Isolate the device from the network to stop the spread",
          "Hard power-off the machine",
          "Run a random 'removal tool' from the web",
        ],
        answer: 1,
        explain: "Isolation stops the spread first. Never pay, and avoid a hard power-off (it can destroy forensic evidence).",
      },
      {
        id: "s2",
        q: "A user's phone keeps buzzing with MFA 'Approve?' prompts they didn't start. Advise them to:",
        options: [
          "Approve one so it stops",
          "Deny every prompt and report it; then reset the password",
          "Turn off MFA",
          "Ignore it",
        ],
        answer: 1,
        explain: "That's MFA fatigue — the attacker has the password. Deny all, reset the password, and enable number-matching.",
      },
      {
        id: "s3",
        q: "A user reports they entered their password on a fake login page. Best immediate response?",
        options: [
          "Scold them for clicking the link",
          "Reset the password and revoke active sessions now, then report the phishing",
          "Tell them to watch it and reset tomorrow",
          "Handle it silently",
        ],
        answer: 1,
        explain: "Never shame a reporter. Compromised credentials are an emergency — reset and revoke immediately, then report.",
      },
      {
        id: "s4",
        q: "An alert shows a sign-in from another country minutes after a local one, on a payroll account. This is:",
        options: [
          "A harmless false alarm to ignore",
          "Likely account compromise — reset, revoke sessions, audit inbox rules, report",
          "Fixed by a password reset alone",
          "Not IT's concern",
        ],
        answer: 1,
        explain: "Impossible-travel on a sensitive account is compromise until proven otherwise — reset, revoke, audit rules, report.",
      },
      {
        id: "s5",
        q: "'The CEO' emails an urgent, secret request to wire $48k to a new vendor now. You should:",
        options: [
          "Send it fast to help the CEO",
          "Reply to the email to confirm",
          "Verify out-of-band on a known phone number before any money moves",
          "Grant whatever access is requested",
        ],
        answer: 2,
        explain: "Urgency + secrecy + a new bank account is classic BEC. Verify out-of-band; never act on the email alone.",
      },
    ],
  },
  {
    id: 4,
    title: "Incident & Leadership Certification",
    icon: "🚀",
    blurb: "Major incidents, offboarding, and de-escalation at the top.",
    passPct: 80,
    questions: [
      {
        id: "l1",
        q: "Email is down company-wide and phones are ringing off the hook. What do you do?",
        options: [
          "Rebuild each user's mail profile one at a time",
          "Declare a major incident: assign a commander, open a bridge, communicate status",
          "Wait quietly until it's fully fixed before saying anything",
          "Tell everyone to reboot",
        ],
        answer: 1,
        explain: "Company-wide = shared service. Declare a major incident and communicate relentlessly — comms are half the job.",
      },
      {
        id: "l2",
        q: "HR needs a terminated employee's access cut immediately. The safest action is to:",
        options: [
          "Delete the account entirely",
          "Just change the password",
          "Disable the account, revoke sessions/tokens, and wipe corporate data from devices",
          "Do nothing until Monday",
        ],
        answer: 2,
        explain: "Disable (don't delete) to preserve data; a password change alone won't kill active sessions — revoke and wipe too.",
      },
      {
        id: "l3",
        q: "An executive is furious after calling three times about the same bug. Open with:",
        options: [
          "\"I don't see notes from those calls, so I can't help.\"",
          "Owning the org's failure and committing to see it through",
          "Explaining it's probably their fault",
          "Telling them to make smaller files",
        ],
        answer: 1,
        explain: "Repeat callers need accountability first — own the failure, fix the tool, and commit to a concrete follow-up.",
      },
      {
        id: "l4",
        q: "A VIP lost a phone with company email in a taxi. First priority?",
        options: [
          "Keep calling the phone",
          "Protect corporate data: MDM locate + lock immediately",
          "Full-wipe everything including personal photos without asking",
          "Do nothing until it's found",
        ],
        answer: 1,
        explain: "Protect corporate data first via MDM lock; prefer a selective wipe and rotate the user's credentials.",
      },
      {
        id: "l5",
        q: "During a confirmed outage with a known ETA, what matters as much as the fix?",
        options: [
          "Silence until resolved",
          "Regular status updates and a workaround for affected users",
          "Blaming the vendor publicly",
          "Closing the incident early",
        ],
        answer: 1,
        explain: "Communication + a workaround keep users sane during outages — and always follow up with a post-incident review.",
      },
    ],
  },
];

export const examById = (id: number) => EXAMS.find((e) => e.id === id);
