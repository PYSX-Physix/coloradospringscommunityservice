import { Title1, Title2, Text, Divider } from "@fluentui/react-components";

export function Privacy() {
  return (
    <div style={{ maxWidth: '900px' }}>
      <Title1>Privacy Policy</Title1>
      <Text style={{ display: 'block', marginTop: '8px', marginBottom: '24px' }}>
        Last Updated: November 28, 2024
      </Text>
      <Divider style={{ marginBottom: '24px' }} />

      <Title2 style={{ marginTop: '24px', marginBottom: '16px' }}>1. Introduction</Title2>
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        Welcome to Colorado Springs Community Service Hub ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our community service event platform.
      </Text>

      <Title2 style={{ marginTop: '24px', marginBottom: '16px' }}>2. Information We Collect</Title2>
      
      <Text style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
        2.1 Personal Information
      </Text>
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        When you create an account, we collect:
      </Text>
      <ul style={{ marginBottom: '16px' }}>
        <li><Text>Email address</Text></li>
        <li><Text>Name (optional display name)</Text></li>
        <li><Text>Password (stored as an encrypted hash)</Text></li>
      </ul>

      <Text style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
        2.2 Event and Participation Data
      </Text>
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        When you use our platform, we collect:
      </Text>
      <ul style={{ marginBottom: '16px' }}>
        <li><Text>Events you create (title, description, location, date/time, participant limits)</Text></li>
        <li><Text>Events you register for or attend</Text></li>
        <li><Text>Attendance records marked by event organizers</Text></li>
        <li><Text>Posts you save or bookmark</Text></li>
        <li><Text>Reports you submit about content</Text></li>
      </ul>

      <Text style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
        2.3 Automatically Collected Information
      </Text>
      <ul style={{ marginBottom: '16px' }}>
        <li><Text>Session cookies for authentication</Text></li>
        <li><Text>Timestamps of actions (account creation, event registration, attendance)</Text></li>
        <li><Text>Device and browser information (for security purposes)</Text></li>
      </ul>

      <Title2 style={{ marginTop: '24px', marginBottom: '16px' }}>3. How We Use Your Information</Title2>
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        We use your information to:
      </Text>
      <ul style={{ marginBottom: '16px' }}>
        <li><Text>Create and manage your account</Text></li>
        <li><Text>Enable you to create, view, and manage community service events</Text></li>
        <li><Text>Facilitate event registration and attendance tracking</Text></li>
        <li><Text>Display your name to other users when you join events or create posts</Text></li>
        <li><Text>Maintain your attendance history for events you've attended</Text></li>
        <li><Text>Send you notifications about events you've joined (if implemented)</Text></li>
        <li><Text>Investigate and respond to reported content</Text></li>
        <li><Text>Improve and secure our platform</Text></li>
      </ul>

      <Title2 style={{ marginTop: '24px', marginBottom: '16px' }}>4. Information Sharing and Disclosure</Title2>
      
      <Text style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
        4.1 Public Information
      </Text>
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        The following information is visible to other users of the platform:
      </Text>
      <ul style={{ marginBottom: '16px' }}>
        <li><Text>Your display name</Text></li>
        <li><Text>Events you create (including all event details)</Text></li>
        <li><Text>Your name appearing on participant lists for events you join</Text></li>
      </ul>

      <Text style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
        4.2 Private Information
      </Text>
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        The following information is kept private:
      </Text>
      <ul style={{ marginBottom: '16px' }}>
        <li><Text>Your email address (never shared publicly)</Text></li>
        <li><Text>Your password (stored encrypted and never accessible)</Text></li>
        <li><Text>Events you've saved/bookmarked</Text></li>
        <li><Text>Your complete attendance history</Text></li>
        <li><Text>Reports you submit</Text></li>
      </ul>

      <Text style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
        4.3 Event Organizer Access
      </Text>
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        Event organizers can see:
      </Text>
      <ul style={{ marginBottom: '16px' }}>
        <li><Text>Names of participants who register for their events</Text></li>
        <li><Text>Registration and attendance status</Text></li>
        <li><Text>Attendance records they create</Text></li>
      </ul>

      <Text style={{ display: 'block', marginBottom: '16px', fontWeight: 'bold' }}>
        4.4 We Do Not Sell Your Data
      </Text>
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        We do not sell, trade, or rent your personal information to third parties. We do not share your data with advertisers or marketing companies.
      </Text>

      <Title2 style={{ marginTop: '24px', marginBottom: '16px' }}>5. Data Retention</Title2>
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        We retain your information as follows:
      </Text>
      <ul style={{ marginBottom: '16px' }}>
        <li><Text><strong>Account Information:</strong> Retained until you delete your account</Text></li>
        <li><Text><strong>Event History:</strong> Attendance records are permanently retained as proof of your community service participation, even if events are deleted by organizers</Text></li>
        <li><Text><strong>Created Events:</strong> Event organizers can delete their events at any time</Text></li>
        <li><Text><strong>Session Data:</strong> Session cookies expire after 7 days of inactivity</Text></li>
      </ul>

      <Title2 style={{ marginTop: '24px', marginBottom: '16px' }}>6. Data Security</Title2>
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        We implement security measures to protect your information:
      </Text>
      <ul style={{ marginBottom: '16px' }}>
        <li><Text>Passwords are hashed using SHA-256 encryption</Text></li>
        <li><Text>Secure HTTPS connections for all data transmission</Text></li>
        <li><Text>Session-based authentication with secure cookies</Text></li>
        <li><Text>Regular security updates and monitoring</Text></li>
      </ul>
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        However, no method of transmission over the internet is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.
      </Text>

      <Title2 style={{ marginTop: '24px', marginBottom: '16px' }}>7. Your Rights and Choices</Title2>
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        You have the right to:
      </Text>
      <ul style={{ marginBottom: '16px' }}>
        <li><Text><strong>Access:</strong> View your personal information and attendance history through your profile</Text></li>
        <li><Text><strong>Update:</strong> Modify your account information (name, email, password)</Text></li>
        <li><Text><strong>Delete:</strong> Request deletion of your account by contacting us</Text></li>
        <li><Text><strong>Opt-out:</strong> Unregister from events before they occur</Text></li>
        <li><Text><strong>Control Visibility:</strong> Choose what display name appears to other users</Text></li>
      </ul>

      <Title2 style={{ marginTop: '24px', marginBottom: '16px' }}>8. Children's Privacy</Title2>
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        Our platform is intended for users aged 13 and older. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
      </Text>

      <Title2 style={{ marginTop: '24px', marginBottom: '16px' }}>9. Content Moderation and Reporting</Title2>
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        We implement content filtering and allow users to report inappropriate content. When you submit a report:
      </Text>
      <ul style={{ marginBottom: '16px' }}>
        <li><Text>Your user ID is associated with the report</Text></li>
        <li><Text>False or malicious reports may result in your account being flagged or suspended</Text></li>
        <li><Text>Reports are reviewed by administrators</Text></li>
      </ul>

      <Title2 style={{ marginTop: '24px', marginBottom: '16px' }}>10. Changes to This Privacy Policy</Title2>
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        We may update this Privacy Policy from time to time. We will notify users of any material changes by updating the "Last Updated" date at the top of this policy. Continued use of the platform after changes constitutes acceptance of the updated policy.
      </Text>

      <Title2 style={{ marginTop: '24px', marginBottom: '16px' }}>11. Contact Us</Title2>
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        If you have questions about this Privacy Policy or our data practices, please contact us through the platform's feedback mechanism or at the contact information provided on our About page.
      </Text>

      <Divider style={{ marginTop: '32px', marginBottom: '16px' }} />
      <Text style={{ display: 'block', fontStyle: 'italic', color: '#666' }}>
        This privacy policy is effective as of November 28, 2024, and applies to all users of the Colorado Springs Community Service Hub platform.
      </Text>
    </div>
  );
}

export function Terms() {
  return (
    <div style={{ maxWidth: '900px' }}>
      <Title1>Terms of Service</Title1>
      <Text style={{ display: 'block', marginTop: '8px', marginBottom: '24px' }}>
        Last Updated: November 28, 2024
      </Text>
      <Divider style={{ marginBottom: '24px' }} />

      <Title2 style={{ marginTop: '24px', marginBottom: '16px' }}>1. Acceptance of Terms</Title2>
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        By accessing or using Colorado Springs Community Service Hub ("the Platform," "we," "our," or "us"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Platform.
      </Text>

      <Title2 style={{ marginTop: '24px', marginBottom: '16px' }}>2. Description of Service</Title2>
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        Colorado Springs Community Service Hub is a free platform that connects community members with volunteer opportunities and community service events in the Colorado Springs area. The Platform allows users to:
      </Text>
      <ul style={{ marginBottom: '16px' }}>
        <li><Text>Create and post community service events</Text></li>
        <li><Text>Browse and register for community service opportunities</Text></li>
        <li><Text>Track attendance at events</Text></li>
        <li><Text>Maintain a history of community service participation</Text></li>
      </ul>

      <Title2 style={{ marginTop: '24px', marginBottom: '16px' }}>3. User Accounts</Title2>
      
      <Text style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
        3.1 Account Creation
      </Text>
      <ul style={{ marginBottom: '16px' }}>
        <li><Text>You must be at least 13 years old to create an account</Text></li>
        <li><Text>You must provide accurate and complete information</Text></li>
        <li><Text>You are responsible for maintaining the confidentiality of your password</Text></li>
        <li><Text>You are responsible for all activities under your account</Text></li>
        <li><Text>One person may not create multiple accounts</Text></li>
      </ul>

      <Text style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
        3.2 Account Security
      </Text>
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        You agree to notify us immediately of any unauthorized access to your account. We are not liable for any loss or damage from your failure to maintain account security.
      </Text>

      <Title2 style={{ marginTop: '24px', marginBottom: '16px' }}>4. User Conduct and Responsibilities</Title2>
      
      <Text style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
        4.1 Prohibited Activities
      </Text>
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        You agree NOT to:
      </Text>
      <ul style={{ marginBottom: '16px' }}>
        <li><Text>Post false, misleading, or fraudulent events</Text></li>
        <li><Text>Use the Platform for commercial or profit-making purposes without permission</Text></li>
        <li><Text>Post spam, advertisements, or promotional content</Text></li>
        <li><Text>Harass, threaten, or abuse other users</Text></li>
        <li><Text>Post offensive, hateful, or discriminatory content</Text></li>
        <li><Text>Post content that violates any laws or regulations</Text></li>
        <li><Text>Impersonate others or misrepresent your affiliation with any organization</Text></li>
        <li><Text>Collect or harvest user information</Text></li>
        <li><Text>Attempt to gain unauthorized access to the Platform or other accounts</Text></li>
        <li><Text>Submit false reports or abuse the reporting system</Text></li>
        <li><Text>Register for events you do not intend to attend</Text></li>
      </ul>

      <Text style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
        4.2 Event Creator Responsibilities
      </Text>
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        If you create events, you agree to:
      </Text>
      <ul style={{ marginBottom: '16px' }}>
        <li><Text>Provide accurate event information (date, time, location, description)</Text></li>
        <li><Text>Host legitimate community service opportunities</Text></li>
        <li><Text>Accurately track and report attendance</Text></li>
        <li><Text>Communicate with registered participants if event details change</Text></li>
        <li><Text>Cancel events promptly if they cannot occur</Text></li>
        <li><Text>Ensure a safe environment for all participants</Text></li>
        <li><Text>Comply with all applicable laws and regulations</Text></li>
      </ul>

      <Text style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
        4.3 Participant Responsibilities
      </Text>
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        If you register for events, you agree to:
      </Text>
      <ul style={{ marginBottom: '16px' }}>
        <li><Text>Only register for events you genuinely intend to attend</Text></li>
        <li><Text>Notify organizers if you can no longer attend</Text></li>
        <li><Text>Arrive on time and prepared</Text></li>
        <li><Text>Follow event organizer instructions and guidelines</Text></li>
        <li><Text>Behave respectfully toward organizers and other participants</Text></li>
      </ul>

      <Title2 style={{ marginTop: '24px', marginBottom: '16px' }}>5. Content and Intellectual Property</Title2>
      
      <Text style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
        5.1 Your Content
      </Text>
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        You retain ownership of content you post (event descriptions, titles, etc.). By posting content, you grant us a non-exclusive, worldwide, royalty-free license to use, display, and distribute your content on the Platform.
      </Text>

      <Text style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
        5.2 Our Rights
      </Text>
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        We reserve the right to remove any content that violates these Terms or is otherwise objectionable, without notice.
      </Text>

      <Text style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
        5.3 Platform Ownership
      </Text>
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        The Platform, including its design, code, features, and trademarks, is owned by us and protected by copyright and other intellectual property laws.
      </Text>

      <Title2 style={{ marginTop: '24px', marginBottom: '16px' }}>6. Attendance Records and Verification</Title2>
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        <strong>Important:</strong> Attendance records on this Platform are managed by event organizers. We do not independently verify attendance.
      </Text>
      <ul style={{ marginBottom: '16px' }}>
        <li><Text>Event organizers are solely responsible for marking accurate attendance</Text></li>
        <li><Text>Attendance records are intended for personal tracking purposes</Text></li>
        <li><Text>We do not guarantee that attendance records will be accepted by schools, organizations, or institutions</Text></li>
        <li><Text>Users should obtain additional verification if required for official purposes</Text></li>
        <li><Text>Falsifying attendance records may result in account termination</Text></li>
      </ul>

      <Title2 style={{ marginTop: '24px', marginBottom: '16px' }}>7. Content Moderation</Title2>
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        We implement automated content filtering and user reporting to maintain platform quality:
      </Text>
      <ul style={{ marginBottom: '16px' }}>
        <li><Text>Content may be automatically flagged for containing inappropriate words</Text></li>
        <li><Text>Users can report problematic content for review</Text></li>
        <li><Text>Administrators review reports and may remove content or suspend accounts</Text></li>
        <li><Text>Repeated violations or false reports may result in account termination</Text></li>
      </ul>

      <Title2 style={{ marginTop: '24px', marginBottom: '16px' }}>8. Disclaimers and Limitations of Liability</Title2>
      
      <Text style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
        8.1 Platform Provided "As Is"
      </Text>
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        The Platform is provided "as is" without warranties of any kind. We do not guarantee:
      </Text>
      <ul style={{ marginBottom: '16px' }}>
        <li><Text>Uninterrupted or error-free service</Text></li>
        <li><Text>Accuracy or reliability of information posted by users</Text></li>
        <li><Text>That the Platform will meet your specific requirements</Text></li>
        <li><Text>Security against unauthorized access or data breaches</Text></li>
      </ul>

      <Text style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
        8.2 No Liability for User-Created Content
      </Text>
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        We are not responsible for:
      </Text>
      <ul style={{ marginBottom: '16px' }}>
        <li><Text>The accuracy of event information posted by users</Text></li>
        <li><Text>Events that are cancelled, rescheduled, or misrepresented</Text></li>
        <li><Text>Interactions between users</Text></li>
        <li><Text>Safety or conditions at user-created events</Text></li>
        <li><Text>Disputes between event organizers and participants</Text></li>
      </ul>

      <Text style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
        8.3 Limitation of Damages
      </Text>
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, consequential, or punitive damages arising from your use of the Platform.
      </Text>

      <Title2 style={{ marginTop: '24px', marginBottom: '16px' }}>9. Indemnification</Title2>
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        You agree to indemnify and hold us harmless from any claims, damages, losses, or expenses (including legal fees) arising from:
      </Text>
      <ul style={{ marginBottom: '16px' }}>
        <li><Text>Your use of the Platform</Text></li>
        <li><Text>Your violation of these Terms</Text></li>
        <li><Text>Content you post on the Platform</Text></li>
        <li><Text>Events you create or attend</Text></li>
        <li><Text>Your violation of any rights of another person or entity</Text></li>
      </ul>

      <Title2 style={{ marginTop: '24px', marginBottom: '16px' }}>10. Termination</Title2>
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        We reserve the right to suspend or terminate your account at any time for:
      </Text>
      <ul style={{ marginBottom: '16px' }}>
        <li><Text>Violation of these Terms</Text></li>
        <li><Text>Fraudulent or abusive behavior</Text></li>
        <li><Text>Extended periods of inactivity</Text></li>
        <li><Text>Any reason at our sole discretion</Text></li>
      </ul>
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        Upon termination, your right to use the Platform will immediately cease. Your attendance history may be retained for record-keeping purposes.
      </Text>

      <Title2 style={{ marginTop: '24px', marginBottom: '16px' }}>11. Beta/Development Status</Title2>
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        This Platform is currently in development and considered a beta product. You acknowledge that:
      </Text>
      <ul style={{ marginBottom: '16px' }}>
        <li><Text>Features may change, be added, or removed without notice</Text></li>
        <li><Text>The Platform may experience bugs, errors, or downtime</Text></li>
        <li><Text>Data loss, while unlikely, is possible during development</Text></li>
        <li><Text>The service is provided free of charge and without warranty</Text></li>
      </ul>

      <Title2 style={{ marginTop: '24px', marginBottom: '16px' }}>12. Privacy</Title2>
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        Your use of the Platform is also governed by our Privacy Policy. Please review it to understand how we collect, use, and protect your information.
      </Text>

      <Title2 style={{ marginTop: '24px', marginBottom: '16px' }}>13. Changes to Terms</Title2>
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        We may modify these Terms at any time. Material changes will be indicated by updating the "Last Updated" date. Continued use of the Platform after changes constitutes acceptance of the modified Terms.
      </Text>

      <Title2 style={{ marginTop: '24px', marginBottom: '16px' }}>14. Dispute Resolution</Title2>
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        Any disputes arising from these Terms or use of the Platform shall be resolved through informal negotiation. If resolution cannot be reached, disputes shall be subject to the laws of the State of Colorado.
      </Text>

      <Title2 style={{ marginTop: '24px', marginBottom: '16px' }}>15. Severability</Title2>
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        If any provision of these Terms is found to be unenforceable, the remaining provisions will remain in full effect.
      </Text>

      <Title2 style={{ marginTop: '24px', marginBottom: '16px' }}>16. Contact Information</Title2>
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        For questions about these Terms of Service, please contact us through the Platform's feedback mechanism or at the contact information provided on our About page.
      </Text>

      <Divider style={{ marginTop: '32px', marginBottom: '16px' }} />
      <Text style={{ display: 'block', fontWeight: 'bold', marginBottom: '16px' }}>
        By using Colorado Springs Community Service Hub, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
      </Text>
      <Text style={{ display: 'block', fontStyle: 'italic', color: '#666' }}>
        Effective Date: November 28, 2024
      </Text>
    </div>
  );
}