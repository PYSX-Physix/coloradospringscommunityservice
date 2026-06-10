import { Link } from 'react-router-dom';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold text-white mb-3">{title}</h2>
      {children}
    </div>
  );
}

function Sub({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <h3 className="text-base font-medium text-gray-200 mb-2">{title}</h3>
      {children}
    </div>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-gray-300 text-sm leading-relaxed mb-2">{children}</p>;
}

function UL({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1 mb-3">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
          <span className="text-blue-400 mt-0.5 shrink-0">•</span>
          <span dangerouslySetInnerHTML={{ __html: item }} />
        </li>
      ))}
    </ul>
  );
}

export function Privacy() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
      <p className="text-sm text-gray-400 mb-6">Last Updated: March 20, 2026</p>
      <div className="divider" />

      <Section title="1. Introduction">
        <P>Welcome to Colorado Springs Community Service Hub ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.</P>
        <P>By using our platform, you agree to the collection and use of information in accordance with this Privacy Policy.</P>
      </Section>

      <Section title="2. Information We Collect">
        <Sub title="2.1 Personal Information">
          <P>When you create an account, we collect:</P>
          <UL items={['<strong>Email address</strong> (required)', '<strong>Name</strong> (optional display name)', '<strong>Password</strong> (stored as an encrypted hash)']} />
        </Sub>
        <Sub title="2.2 Event and Participation Data">
          <UL items={['Events you create: title, description, location, date/time, participant limits', 'Events you register for: registration timestamp, participation status', 'Attendance records: check-in status marked by event organizers', 'Saved posts: Events you bookmark', 'Reports you submit: category, description, timestamp']} />
        </Sub>
        <Sub title="2.3 Automatically Collected Information">
          <UL items={['Session cookies for authentication (expires after 7 days)', 'Timestamps of actions', 'User activity logs for moderation and security']} />
        </Sub>
      </Section>

      <Section title="3. How We Use Your Information">
        <UL items={['Create and manage your account', 'Enable you to create, view, and manage community service events', 'Facilitate event registration and attendance tracking', 'Display your name to other users when you join events', 'Maintain your attendance history', 'Send notifications about events you\'ve joined', 'Investigate and respond to reported content', 'Maintain platform security and prevent abuse']} />
      </Section>

      <Section title="4. Information Sharing">
        <Sub title="4.1 Public Information">
          <P>The following information is visible to other users:</P>
          <UL items={['Your display name', 'Events you create (all event details)', 'Your name on participant lists for events you join']} />
        </Sub>
        <Sub title="4.2 Private Information">
          <UL items={['Your email address (never shared publicly)', 'Your password (never accessible to anyone)', 'Events you\'ve saved/bookmarked', 'Your complete attendance history (only visible to you)', 'Reports you submit (only visible to administrators)']} />
        </Sub>
        <Sub title="4.3 We Do Not Sell Your Data">
          <UL items={['We do <strong>not</strong> sell, trade, or rent your personal information to third parties', 'We do <strong>not</strong> share your data with advertisers or marketing companies', 'We do <strong>not</strong> use your data for advertising purposes']} />
        </Sub>
      </Section>

      <Section title="5. Data Security">
        <Sub title="5.1 Password Security">
          <UL items={['Passwords are hashed using PBKDF2 with 100,000 iterations and a unique random salt', 'Passwords are never stored in plain text', 'Accounts created before March 2026 used SHA-256 and are automatically upgraded on next sign-in']} />
        </Sub>
        <Sub title="5.2 Connection Security">
          <UL items={['Secure HTTPS connections for all data transmission', 'Session-based authentication with secure, HTTP-only cookies', 'Cookies are marked Secure and SameSite=Lax']} />
        </Sub>
      </Section>

      <Section title="6. Children's Privacy">
        <UL items={['Our platform is intended for users aged <strong>13 and older</strong>', 'We do not knowingly collect personal information from children under 13', 'If you believe your child has provided us with personal information, please contact us immediately']} />
      </Section>

      <Section title="7. Contact Information">
        <P>For questions about this Privacy Policy:</P>
        <UL items={['Through the platform: Use the feedback mechanism in the app', 'Visit our <a href="/about" class="text-blue-400 hover:underline">About page</a> for current contact information']} />
      </Section>

      <div className="divider mt-8" />
      <p className="text-xs text-gray-500 italic">Effective as of December 27, 2025, and applies to all users of the Colorado Springs Community Service Hub.</p>
    </div>
  );
}

export function Terms() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold text-white mb-2">Terms of Service</h1>
      <p className="text-sm text-gray-400 mb-6">Last Updated: December 27, 2025</p>
      <div className="divider" />

      <Section title="1. Acceptance of Terms">
        <P>By accessing or using Colorado Springs Community Service Hub, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Platform.</P>
      </Section>

      <Section title="2. Description of Service">
        <P>Colorado Springs Community Service Hub is a free platform that connects community members with volunteer opportunities and events in the Colorado Springs area. The Platform allows users to:</P>
        <UL items={['Create and post community service events', 'Browse and register for community service opportunities', 'Track attendance at events', 'Maintain a history of community service participation']} />
      </Section>

      <Section title="3. User Accounts">
        <Sub title="3.1 Account Creation">
          <UL items={['You must be at least 13 years old to create an account', 'You must provide accurate and complete information', 'You are responsible for maintaining the confidentiality of your password', 'One person may not create multiple accounts']} />
        </Sub>
      </Section>

      <Section title="4. Prohibited Activities">
        <P>You agree NOT to:</P>
        <UL items={['Post false, misleading, or fraudulent events', 'Use the Platform for commercial purposes without permission', 'Post spam, advertisements, or promotional content', 'Harass, threaten, or abuse other users', 'Post offensive, hateful, or discriminatory content', 'Submit false reports or abuse the reporting system', 'Register for events you do not intend to attend']} />
      </Section>

      <Section title="5. Attendance Records">
        <P><strong>Important:</strong> Attendance records on this Platform are managed by event organizers. We do not independently verify attendance.</P>
        <UL items={['Event organizers are solely responsible for marking accurate attendance', 'Attendance records are intended for personal tracking purposes', 'We do not guarantee that records will be accepted by schools or organizations', 'Falsifying attendance records may result in account termination']} />
      </Section>

      <Section title="6. Beta/Development Status">
        <P>This Platform is currently in development and considered a beta product. You acknowledge that:</P>
        <UL items={['Features may change, be added, or removed without notice', 'The Platform may experience bugs, errors, or downtime', 'Data loss, while unlikely, is possible during development', 'The service is provided free of charge and without warranty']} />
      </Section>

      <Section title="7. Governing Law">
        <P>These Terms shall be governed by the laws of the State of Colorado, United States. Any legal action will be brought in the courts of Colorado Springs, Colorado.</P>
      </Section>

      <Section title="8. Contact Information">
        <P>For questions about these Terms of Service, please contact us through the platform or visit our <Link to="/about" className="text-blue-400 hover:underline">About page</Link>.</P>
      </Section>

      <div className="divider mt-8" />
      <p className="text-sm font-semibold text-gray-300 mb-2">
        By using Colorado Springs Community Service Hub, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
      </p>
      <p className="text-xs text-gray-500 italic">Effective Date: December 27, 2025</p>
    </div>
  );
}