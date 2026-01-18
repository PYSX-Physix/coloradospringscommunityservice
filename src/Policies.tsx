import { Title1, Title2, Title3, Text, Divider } from "@fluentui/react-components";

export function Privacy() {
  return (
    <div style={{ maxWidth: '900px' }}>
      <Title1>Privacy Policy</Title1>
      <Text style={{ display: 'block', marginTop: '8px', marginBottom: '24px' }}>
        Last Updated: December 27, 2025
      </Text>
      <Divider style={{ marginBottom: '24px' }} />

      <Title2 style={{ marginTop: '24px', marginBottom: '16px' }}>1. Introduction</Title2>
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        Welcome to Colorado Springs Community Service Hub ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our community service event platform.
      </Text>
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        By using our platform, you agree to the collection and use of information in accordance with this Privacy Policy.
      </Text>

      <Title2 style={{ marginTop: '24px', marginBottom: '16px' }}>2. Information We Collect</Title2>
      <br/>
      <Title3 style={{ marginTop: '16px', marginBottom: '12px' }}>2.1 Personal Information</Title3>
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        When you create an account, we collect:
      </Text>
      <ul style={{ marginBottom: '16px' }}>
        <li><Text><strong>Email address</strong> (required)</Text></li>
        <li><Text><strong>Name</strong> (optional display name)</Text></li>
        <li><Text><strong>Password</strong> (stored as an encrypted SHA-256 hash)</Text></li>
      </ul>

      <Title3 style={{ marginTop: '16px', marginBottom: '12px' }}>2.2 Event and Participation Data</Title3>
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        When you use our platform, we collect:
      </Text>
      <ul style={{ marginBottom: '16px' }}>
        <li><Text><strong>Events you create:</strong> title, description, location, date/time, participant limits, optional image URLs</Text></li>
        <li><Text><strong>Events you register for:</strong> registration timestamp, participation status</Text></li>
        <li><Text><strong>Attendance records:</strong> Check-in status marked by event organizers, timestamp of attendance</Text></li>
        <li><Text><strong>Saved posts:</strong> Events you bookmark or save for later</Text></li>
        <li><Text><strong>Reports you submit:</strong> Category, description, timestamp, and context about reported content or users</Text></li>
      </ul>

      <Title3 style={{ marginTop: '16px', marginBottom: '12px' }}>2.3 Automatically Collected Information</Title3>
      <ul style={{ marginBottom: '16px' }}>
        <li><Text><strong>Session cookies</strong> for authentication (expires after 7 days)</Text></li>
        <li><Text><strong>Timestamps</strong> of actions (account creation, event registration, attendance, reports)</Text></li>
        <li><Text><strong>User activity logs</strong> for moderation and security purposes</Text></li>
      </ul>

      <Title3 style={{ marginTop: '16px', marginBottom: '12px' }}>2.4 Location Data</Title3>
      <ul style={{ marginBottom: '16px' }}>
        <li><Text><strong>Event locations</strong> you enter when creating events (addresses you provide)</Text></li>
        <li><Text><strong>No GPS tracking:</strong> We do not collect your device location</Text></li>
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
        <li><Text>Send you notifications about events you've joined, check-ins, and moderation actions</Text></li>
        <li><Text>Investigate and respond to reported content and user behavior</Text></li>
        <li><Text>Maintain platform security and prevent abuse</Text></li>
        <li><Text>Improve and secure our platform</Text></li>
      </ul>

      <Title2 style={{ marginTop: '24px', marginBottom: '16px' }}>4. Information Sharing and Disclosure</Title2>
      <br/>
      <Title3 style={{ marginTop: '16px', marginBottom: '12px' }}>4.1 Public Information</Title3>
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        The following information is <strong>visible to other users</strong>:
      </Text>
      <ul style={{ marginBottom: '16px' }}>
        <li><Text>Your display name (name or email you choose to display)</Text></li>
        <li><Text>Events you create (including all event details: title, description, location, date/time, image)</Text></li>
        <li><Text>Your name appearing on participant lists for events you join</Text></li>
      </ul>

      <Title3 style={{ marginTop: '16px', marginBottom: '12px' }}>4.2 Private Information</Title3>
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        The following information is <strong>kept private</strong>:
      </Text>
      <ul style={{ marginBottom: '16px' }}>
        <li><Text>Your email address (never shared publicly or with other users)</Text></li>
        <li><Text>Your password (stored encrypted and never accessible to anyone)</Text></li>
        <li><Text>Events you've saved/bookmarked</Text></li>
        <li><Text>Your complete attendance history (only visible to you in your profile)</Text></li>
        <li><Text>Reports you submit (only visible to administrators)</Text></li>
        <li><Text>Session data and authentication tokens</Text></li>
      </ul>

      <Title3 style={{ marginTop: '16px', marginBottom: '12px' }}>4.3 Event Organizer Access</Title3>
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        Event organizers can see:
      </Text>
      <ul style={{ marginBottom: '16px' }}>
        <li><Text>Names of participants who register for their events</Text></li>
        <li><Text>Registration timestamps</Text></li>
        <li><Text>Attendance status (who they've marked as attended)</Text></li>
        <li><Text>Attendance records they create for their events</Text></li>
      </ul>
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        Event organizers <strong>cannot</strong> see:
      </Text>
      <ul style={{ marginBottom: '16px' }}>
        <li><Text>Email addresses of participants</Text></li>
        <li><Text>Other events participants have joined</Text></li>
        <li><Text>Participants' full attendance history</Text></li>
      </ul>

      <Title3 style={{ marginTop: '16px', marginBottom: '12px' }}>4.4 Administrator Access</Title3>
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        Platform administrators can access:
      </Text>
      <ul style={{ marginBottom: '16px' }}>
        <li><Text>Reported content and user reports for moderation purposes</Text></li>
        <li><Text>User account information for investigating violations</Text></li>
        <li><Text>Aggregate platform statistics (total users, events, reports)</Text></li>
        <li><Text>Moderation history and actions taken</Text></li>
      </ul>

      <Title3 style={{ marginTop: '16px', marginBottom: '12px' }}>4.5 We Do Not Sell Your Data</Title3>
      <ul style={{ marginBottom: '16px' }}>
        <li><Text>We <strong>do not</strong> sell, trade, or rent your personal information to third parties</Text></li>
        <li><Text>We <strong>do not</strong> share your data with advertisers or marketing companies</Text></li>
        <li><Text>We <strong>do not</strong> use your data for advertising purposes</Text></li>
      </ul>

      <Title2 style={{ marginTop: '24px', marginBottom: '16px' }}>5. Data Retention</Title2>
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        We retain your information as follows:
      </Text>
      <ul style={{ marginBottom: '16px' }}>
        <li><Text><strong>Account Information:</strong> Until you delete your account</Text></li>
        <li><Text><strong>Event History:</strong> Attendance records for events you attended are permanently retained as proof of community service participation, even if events are deleted by organizers</Text></li>
        <li><Text><strong>Created Events:</strong> Event organizers can delete their events at any time. Deleted events are removed from public view but attendance records are preserved</Text></li>
        <li><Text><strong>Session Data:</strong> Session cookies expire after 7 days of inactivity</Text></li>
        <li><Text><strong>Reports:</strong> Retained indefinitely for moderation and pattern analysis</Text></li>
        <li><Text><strong>Notifications:</strong> Retained until you delete them or delete your account</Text></li>
        <li><Text><strong>Saved Posts:</strong> Retained until you unsave them or delete your account</Text></li>
      </ul>

      <Title3 style={{ marginTop: '16px', marginBottom: '12px' }}>Important Note on Attendance Records</Title3>
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        When an event organizer marks you as "attended," that information is permanently saved to your profile to preserve your community service record. This ensures you maintain credit for your participation even if:
      </Text>
      <ul style={{ marginBottom: '16px' }}>
        <li><Text>The event is later deleted by the organizer</Text></li>
        <li><Text>The organizer's account is closed</Text></li>
        <li><Text>The event details are modified</Text></li>
      </ul>

      <Title2 style={{ marginTop: '24px', marginBottom: '16px' }}>6. Data Security</Title2>
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        We implement security measures to protect your information:
      </Text>

      <Title3 style={{ marginTop: '16px', marginBottom: '12px' }}>6.1 Password Security</Title3>
      <ul style={{ marginBottom: '16px' }}>
        <li><Text>Passwords are hashed using SHA-256 encryption</Text></li>
        <li><Text>Passwords are never stored in plain text</Text></li>
        <li><Text>Passwords are never visible to administrators or anyone else</Text></li>
      </ul>

      <Title3 style={{ marginTop: '16px', marginBottom: '12px' }}>6.2 Connection Security</Title3>
      <ul style={{ marginBottom: '16px' }}>
        <li><Text>Secure HTTPS connections for all data transmission</Text></li>
        <li><Text>Session-based authentication with secure, HTTP-only cookies</Text></li>
        <li><Text>Cookies are marked as Secure and SameSite=Lax</Text></li>
      </ul>

      <Title3 style={{ marginTop: '16px', marginBottom: '12px' }}>6.3 Platform Security</Title3>
      <ul style={{ marginBottom: '16px' }}>
        <li><Text>Regular security updates and monitoring</Text></li>
        <li><Text>Content filtering to detect inappropriate or malicious content</Text></li>
        <li><Text>Rate limiting on reports and sensitive actions to prevent abuse</Text></li>
        <li><Text>Server-side validation of all user inputs</Text></li>
      </ul>

      <Title3 style={{ marginTop: '16px', marginBottom: '12px' }}>6.4 Limitations</Title3>
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        However, no method of transmission over the internet is 100% secure. While we strive to protect your data using commercially acceptable means, we cannot guarantee absolute security.
      </Text>

      <Title2 style={{ marginTop: '24px', marginBottom: '16px' }}>7. Your Rights and Choices</Title2>
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        You have the right to:
      </Text>

      <Title3 style={{ marginTop: '16px', marginBottom: '12px' }}>7.1 Access</Title3>
      <ul style={{ marginBottom: '16px' }}>
        <li><Text>View your personal information through your profile</Text></li>
        <li><Text>Download your attendance history</Text></li>
        <li><Text>View events you've created, joined, or saved</Text></li>
      </ul>

      <Title3 style={{ marginTop: '16px', marginBottom: '12px' }}>7.2 Update</Title3>
      <ul style={{ marginBottom: '16px' }}>
        <li><Text>Modify your account information (name, email, password) through settings</Text></li>
        <li><Text>Edit events you've created (title, description, location, time, participant limits)</Text></li>
      </ul>

      <Title3 style={{ marginTop: '16px', marginBottom: '12px' }}>7.3 Delete</Title3>
      <ul style={{ marginBottom: '16px' }}>
        <li><Text>Unregister from events before they occur</Text></li>
        <li><Text>Unsave/unbookmark events</Text></li>
        <li><Text>Delete events you've created (attendance records for attended participants are preserved)</Text></li>
        <li><Text>Request deletion of your account (contact us)</Text></li>
      </ul>

      <Title3 style={{ marginTop: '16px', marginBottom: '12px' }}>7.4 Control Visibility</Title3>
      <ul style={{ marginBottom: '16px' }}>
        <li><Text>Choose what display name appears to other users (name or email)</Text></li>
      </ul>

      <Title3 style={{ marginTop: '16px', marginBottom: '12px' }}>7.5 Manage Notifications</Title3>
      <ul style={{ marginBottom: '16px' }}>
        <li><Text>Mark notifications as read</Text></li>
        <li><Text>View notification history</Text></li>
      </ul>

      <Title3 style={{ marginTop: '16px', marginBottom: '12px' }}>7.6 Data Portability</Title3>
      <ul style={{ marginBottom: '16px' }}>
        <li><Text>Download attendance sheets for events you organize (HTML format)</Text></li>
        <li><Text>Export your attendance history (accessible through your profile)</Text></li>
      </ul>

      <Title2 style={{ marginTop: '24px', marginBottom: '16px' }}>8. Cookies and Tracking</Title2>
      <br/>
      <Title3 style={{ marginTop: '16px', marginBottom: '12px' }}>8.1 Cookies We Use</Title3>
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        We use cookies for:
      </Text>
      <ul style={{ marginBottom: '16px' }}>
        <li><Text><strong>Authentication:</strong> Session cookies to keep you logged in</Text></li>
        <li><Text><strong>Session Management:</strong> Tracking your login state and user preferences</Text></li>
      </ul>

      <Title3 style={{ marginTop: '16px', marginBottom: '12px' }}>8.2 Cookie Details</Title3>
      <ul style={{ marginBottom: '16px' }}>
        <li><Text><strong>Session Cookie Name:</strong> session</Text></li>
        <li><Text><strong>Expiration:</strong> 7 days from last activity</Text></li>
        <li><Text><strong>Purpose:</strong> Authentication and session management only</Text></li>
        <li><Text><strong>Third-party cookies:</strong> We do not use third-party tracking cookies</Text></li>
      </ul>

      <Title3 style={{ marginTop: '16px', marginBottom: '12px' }}>8.3 Managing Cookies</Title3>
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        You can control cookies through your browser settings. However, disabling cookies will prevent you from logging into the platform.
      </Text>

      <Title2 style={{ marginTop: '24px', marginBottom: '16px' }}>9. Children's Privacy</Title2>
      <ul style={{ marginBottom: '16px' }}>
        <li><Text>Our platform is intended for users aged <strong>13 and older</strong></Text></li>
        <li><Text>We do not knowingly collect personal information from children under 13</Text></li>
        <li><Text>If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately</Text></li>
        <li><Text>We will delete such information from our records</Text></li>
      </ul>

      <Title2 style={{ marginTop: '24px', marginBottom: '16px' }}>10. Content Moderation and Reporting</Title2>
      <br/>
      <Title3 style={{ marginTop: '16px', marginBottom: '12px' }}>10.1 Content Filtering</Title3>
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        We implement:
      </Text>
      <ul style={{ marginBottom: '16px' }}>
        <li><Text>Automated content filtering to detect inappropriate words and phrases</Text></li>
        <li><Text>Blacklist of prohibited terms (spam indicators, scams, harassment, threats)</Text></li>
        <li><Text>Real-time content analysis for new posts and event descriptions</Text></li>
      </ul>

      <Title3 style={{ marginTop: '16px', marginBottom: '12px' }}>10.2 User Reporting System</Title3>
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        When you submit a report:
      </Text>
      <ul style={{ marginBottom: '16px' }}>
        <li><Text>Your user ID is associated with the report for accountability</Text></li>
        <li><Text>Reports are reviewed by administrators</Text></li>
        <li><Text>False or malicious reports may result in your account being flagged or suspended</Text></li>
        <li><Text>You can submit up to 5 reports per day to prevent abuse</Text></li>
        <li><Text>You cannot report the same user within 24 hours</Text></li>
      </ul>

      <Title3 style={{ marginTop: '16px', marginBottom: '12px' }}>10.3 Report Categories</Title3>
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        Available report categories:
      </Text>
      <ul style={{ marginBottom: '16px' }}>
        <li><Text>Inappropriate Content</Text></li>
        <li><Text>Spam or Misleading</Text></li>
        <li><Text>Safety Concerns</Text></li>
        <li><Text>Terms Violation</Text></li>
        <li><Text>No-Show or Cancellation Issues</Text></li>
        <li><Text>Other</Text></li>
      </ul>

      <Title3 style={{ marginTop: '16px', marginBottom: '12px' }}>10.4 Automated Actions</Title3>
      <ul style={{ marginBottom: '16px' }}>
        <li><Text>Posts that receive <strong>3 or more pending reports</strong> are automatically hidden from public view pending moderator review</Text></li>
        <li><Text>This protects the community while administrators investigate</Text></li>
      </ul>

      <Title3 style={{ marginTop: '16px', marginBottom: '12px' }}>10.5 Administrator Review</Title3>
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        When reviewing reports, administrators can:
      </Text>
      <ul style={{ marginBottom: '16px' }}>
        <li><Text>View report details and context</Text></li>
        <li><Text>Access reported content and user information</Text></li>
        <li><Text>Take actions: warning, content removal, temporary ban, permanent ban</Text></li>
        <li><Text>Mark reports as resolved, dismissed, or duplicate</Text></li>
        <li><Text>Add notes explaining their decision</Text></li>
      </ul>

      <Title2 style={{ marginTop: '24px', marginBottom: '16px' }}>11. Third-Party Services</Title2>
      <br/>
      <Title3 style={{ marginTop: '16px', marginBottom: '12px' }}>11.1 Address Autocomplete</Title3>
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        We use <strong>Nominatim (OpenStreetMap)</strong> for address autocomplete:
      </Text>
      <ul style={{ marginBottom: '16px' }}>
        <li><Text><strong>Purpose:</strong> Help you enter accurate event locations</Text></li>
        <li><Text><strong>Data shared:</strong> Address search queries you type</Text></li>
        <li><Text><strong>Privacy:</strong> Nominatim is free and open-source. We do not send any personal identifying information</Text></li>
        <li><Text><strong>Location:</strong> https://nominatim.openstreetmap.org</Text></li>
      </ul>

      <Title3 style={{ marginTop: '16px', marginBottom: '12px' }}>11.2 Calendar Exports</Title3>
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        We provide calendar export links for:
      </Text>
      <ul style={{ marginBottom: '16px' }}>
        <li><Text>Google Calendar</Text></li>
        <li><Text>Outlook Calendar</Text></li>
        <li><Text>Yahoo Calendar</Text></li>
        <li><Text>Apple Calendar (via .ics file download)</Text></li>
      </ul>
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        <strong>Important:</strong> When you use these links, you are leaving our platform and subject to those services' privacy policies. We do not control how these services handle your data.
      </Text>

      <Title3 style={{ marginTop: '16px', marginBottom: '12px' }}>11.3 Cloudflare CDN</Title3>
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        We use Cloudflare for:
      </Text>
      <ul style={{ marginBottom: '16px' }}>
        <li><Text>Content delivery (Three.js library)</Text></li>
        <li><Text>Performance optimization</Text></li>
        <li><Text>DDoS protection</Text></li>
      </ul>
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        Cloudflare may process your IP address and browser information. See Cloudflare's privacy policy for details.
      </Text>

      <Title3 style={{ marginTop: '16px', marginBottom: '12px' }}>11.4 No Analytics or Advertising Services</Title3>
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        We do <strong>not</strong> use:
      </Text>
      <ul style={{ marginBottom: '16px' }}>
        <li><Text>Google Analytics or similar tracking services</Text></li>
        <li><Text>Facebook Pixel or social media trackers</Text></li>
        <li><Text>Third-party advertising networks</Text></li>
        <li><Text>Any external analytics or marketing tools</Text></li>
      </ul>

      <Title2 style={{ marginTop: '24px', marginBottom: '16px' }}>12. Notifications</Title2>
      <br/>
      <Title3 style={{ marginTop: '16px', marginBottom: '12px' }}>12.1 Types of Notifications</Title3>
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        We may send you notifications for:
      </Text>
      <ul style={{ marginBottom: '16px' }}>
        <li><Text><strong>Event reminders:</strong> Upcoming events you've registered for (planned feature)</Text></li>
        <li><Text><strong>Check-in confirmations:</strong> When an organizer marks you as attended</Text></li>
        <li><Text><strong>Moderation notices:</strong> Actions taken on reported content</Text></li>
        <li><Text><strong>System announcements:</strong> Important platform updates</Text></li>
      </ul>

      <Title3 style={{ marginTop: '16px', marginBottom: '12px' }}>12.2 Notification Settings</Title3>
      <ul style={{ marginBottom: '16px' }}>
        <li><Text>Notifications are displayed in-app through the notification panel</Text></li>
        <li><Text>You can mark notifications as read or mark all as read</Text></li>
        <li><Text>Notifications are stored until you delete them</Text></li>
        <li><Text><strong>Email notifications:</strong> Currently not implemented (planned feature)</Text></li>
      </ul>

      <Title3 style={{ marginTop: '16px', marginBottom: '12px' }}>12.3 Notification Data</Title3>
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        Notifications contain:
      </Text>
      <ul style={{ marginBottom: '16px' }}>
        <li><Text>Notification type (reminder, check-in, moderation)</Text></li>
        <li><Text>Title and message</Text></li>
        <li><Text>Link to relevant content (optional)</Text></li>
        <li><Text>Timestamp</Text></li>
        <li><Text>Read/unread status</Text></li>
      </ul>

      <Title2 style={{ marginTop: '24px', marginBottom: '16px' }}>13. Changes to This Privacy Policy</Title2>
      <br/>
      <Title3 style={{ marginTop: '16px', marginBottom: '12px' }}>13.1 Updates</Title3>
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        We may update this Privacy Policy from time to time. We will notify users of any material changes by:
      </Text>
      <ul style={{ marginBottom: '16px' }}>
        <li><Text>Updating the "Last Updated" date at the top of this policy</Text></li>
        <li><Text>Displaying a notice on the platform</Text></li>
        <li><Text>Sending an in-app notification (for significant changes)</Text></li>
      </ul>

      <Title3 style={{ marginTop: '16px', marginBottom: '12px' }}>13.2 Continued Use</Title3>
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        Continued use of the platform after changes constitutes acceptance of the updated policy. We encourage you to review this Privacy Policy periodically.
      </Text>

      <Title2 style={{ marginTop: '24px', marginBottom: '16px' }}>14. Contact Information</Title2>
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        If you have questions about this Privacy Policy or our data practices, please contact us:
      </Text>
      <Text style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
        Colorado Springs Community Service Hub
      </Text>
      <ul style={{ marginBottom: '16px' }}>
        <li><Text><strong>Through the platform:</strong> Use the feedback mechanism in the app</Text></li>
        <li><Text><strong>Visit:</strong> Check our About page for current contact information</Text></li>
      </ul>
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        For privacy-related inquiries, please include:
      </Text>
      <ul style={{ marginBottom: '16px' }}>
        <li><Text>Your name and email address used on the platform</Text></li>
        <li><Text>Description of your request or concern</Text></li>
        <li><Text>Relevant account or event information (if applicable)</Text></li>
      </ul>
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        We will respond to privacy requests within 30 days.
      </Text>

      <Divider style={{ marginTop: '32px', marginBottom: '16px' }} />
      <Text style={{ display: 'block', fontStyle: 'italic', color: '#666' }}>
        This privacy policy is effective as of December 27, 2025, and applies to all users of the Colorado Springs Community Service Hub platform.
      </Text>
    </div>
  );
}

export function Terms() {
  return (
    <div style={{ maxWidth: '900px' }}>
      <Title1>Terms of Service</Title1>
      <Text style={{ display: 'block', marginTop: '8px', marginBottom: '24px' }}>
        Last Updated: December 27, 2025
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
      <br/>
      <Title3 style={{ marginTop: '16px', marginBottom: '12px' }}>3.1 Account Creation</Title3>
      <ul style={{ marginBottom: '16px' }}>
        <li><Text>You must be at least 13 years old to create an account</Text></li>
        <li><Text>You must provide accurate and complete information</Text></li>
        <li><Text>You are responsible for maintaining the confidentiality of your password</Text></li>
        <li><Text>You are responsible for all activities under your account</Text></li>
        <li><Text>One person may not create multiple accounts</Text></li>
      </ul>

      <Title3 style={{ marginTop: '16px', marginBottom: '12px' }}>3.2 Account Security</Title3>
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        You agree to notify us immediately of any unauthorized access to your account. We are not liable for any loss or damage from your failure to maintain account security.
      </Text>

      <Title2 style={{ marginTop: '24px', marginBottom: '16px' }}>4. User Conduct and Responsibilities</Title2>
      <br/>
      <Title3 style={{ marginTop: '16px', marginBottom: '12px' }}>4.1 Prohibited Activities</Title3>
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

      <Title3 style={{ marginTop: '16px', marginBottom: '12px' }}>4.2 Event Creator Responsibilities</Title3>
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

      <Title3 style={{ marginTop: '16px', marginBottom: '12px' }}>4.3 Participant Responsibilities</Title3>
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
      <br/>
      <Title3 style={{ marginTop: '16px', marginBottom: '12px' }}>5.1 Your Content</Title3>
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        You retain ownership of content you post (event descriptions, titles, etc.). By posting content, you grant us a non-exclusive, worldwide, royalty-free license to use, display, and distribute your content on the Platform.
      </Text>

      <Title3 style={{ marginTop: '16px', marginBottom: '12px' }}>5.2 Our Rights</Title3>
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        We reserve the right to remove any content that violates these Terms or is otherwise objectionable, without notice.
      </Text>

      <Title3 style={{ marginTop: '16px', marginBottom: '12px' }}>5.3 Platform Ownership</Title3>
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
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        Falsifying attendance records (either as an organizer or participant) may result in immediate account termination and may be reported to relevant authorities or institutions.
      </Text>

      <Title2 style={{ marginTop: '24px', marginBottom: '16px' }}>7. Content Moderation and Reporting</Title2>
      <br/>
      <Title3 style={{ marginTop: '16px', marginBottom: '12px' }}>7.1 Automated Content Filtering</Title3>
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        We implement automated content filtering to maintain platform quality:
      </Text>
      <ul style={{ marginBottom: '16px' }}>
        <li><Text>Content may be automatically flagged for containing inappropriate words</Text></li>
        <li><Text>Users can report problematic content for review</Text></li>
        <li><Text>Administrators review reports and may remove content or suspend accounts</Text></li>
        <li><Text>Repeated violations or false reports may result in account termination</Text></li>
      </ul>

      <Title2 style={{ marginTop: '24px', marginBottom: '16px' }}>8. Disclaimers and Limitations of Liability</Title2>
      <br/>
      <Title3 style={{ marginTop: '16px', marginBottom: '12px' }}>8.1 Platform Provided "As Is"</Title3>
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        The Platform is provided "as is" without warranties of any kind. We do not guarantee:
      </Text>
      <ul style={{ marginBottom: '16px' }}>
        <li><Text>Uninterrupted or error-free service</Text></li>
        <li><Text>Accuracy or reliability of information posted by users</Text></li>
        <li><Text>That the Platform will meet your specific requirements</Text></li>
        <li><Text>Security against unauthorized access or data breaches</Text></li>
      </ul>

      <Title3 style={{ marginTop: '16px', marginBottom: '12px' }}>8.2 No Liability for User-Created Content</Title3>
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

      <Title3 style={{ marginTop: '16px', marginBottom: '12px' }}>8.3 Limitation of Damages</Title3>
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
      <br/>
      <Title3 style={{ marginTop: '16px', marginBottom: '12px' }}>10.1 Our Right to Terminate</Title3>
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

      <Title2 style={{ marginTop: '24px', marginBottom: '16px' }}>14. Dispute Resolution and Governing Law</Title2>
      <br/>
      <Title3 style={{ marginTop: '16px', marginBottom: '12px' }}>14.1 Informal Resolution</Title3>
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        Any disputes arising from these Terms or use of the Platform shall first be resolved through informal negotiation.
      </Text>

      <Title3 style={{ marginTop: '16px', marginBottom: '12px' }}>14.2 Governing Law</Title3>
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        These Terms shall be governed by and construed in accordance with the laws of the State of Colorado, United States, without regard to its conflict of law provisions.
      </Text>

      <Title3 style={{ marginTop: '16px', marginBottom: '12px' }}>14.3 Jurisdiction</Title3>
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        Any legal action or proceeding arising under these Terms will be brought exclusively in the courts located in Colorado Springs, Colorado, and you consent to personal jurisdiction in such courts.
      </Text>

      <Title2 style={{ marginTop: '24px', marginBottom: '16px' }}>15. Severability and Waiver</Title2>
      <br/>
      <Title3 style={{ marginTop: '16px', marginBottom: '12px' }}>15.1 Severability</Title3>
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        If any provision of these Terms is found to be unenforceable or invalid, that provision will be limited or eliminated to the minimum extent necessary so that these Terms remain in full force and effect.
      </Text>

      <Title3 style={{ marginTop: '16px', marginBottom: '12px' }}>15.2 Waiver</Title3>
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. Any waiver must be in writing and signed by us.
      </Text>

      <Title2 style={{ marginTop: '24px', marginBottom: '16px' }}>16. Entire Agreement</Title2>
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        These Terms, together with our Privacy Policy, constitute the entire agreement between you and us regarding the use of the Platform and supersede all prior agreements and understandings.
      </Text>

      <Title2 style={{ marginTop: '24px', marginBottom: '16px' }}>17. Contact Information</Title2>
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        For questions about these Terms of Service, please contact us:
      </Text>
      <Text style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
        Colorado Springs Community Service Hub
      </Text>
      <ul style={{ marginBottom: '16px' }}>
        <li><Text><strong>Through the platform:</strong> Use the feedback mechanism in the app</Text></li>
        <li><Text><strong>Visit:</strong> Check our About page for current contact information</Text></li>
      </ul>

      <Title2 style={{ marginTop: '24px', marginBottom: '16px' }}>18. Additional Terms for Specific Features</Title2>
      <br/>
      <Title3 style={{ marginTop: '16px', marginBottom: '12px' }}>18.1 Notifications</Title3>
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        By using the Platform, you consent to receive notifications about:
      </Text>
      <ul style={{ marginBottom: '16px' }}>
        <li><Text>Events you've registered for</Text></li>
        <li><Text>Attendance check-ins</Text></li>
        <li><Text>Moderation actions on your content or reports</Text></li>
        <li><Text>Important platform updates</Text></li>
      </ul>

      <Title3 style={{ marginTop: '16px', marginBottom: '12px' }}>18.2 Calendar Exports</Title3>
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        Calendar export features (Google Calendar, Outlook, Yahoo, Apple Calendar) are provided for convenience. We are not responsible for:
      </Text>
      <ul style={{ marginBottom: '16px' }}>
        <li><Text>Errors in calendar event data</Text></li>
        <li><Text>Compatibility issues with calendar applications</Text></li>
        <li><Text>Changes to third-party calendar APIs</Text></li>
      </ul>

      <Title3 style={{ marginTop: '16px', marginBottom: '12px' }}>18.3 Downloadable Content</Title3>
      <Text style={{ display: 'block', marginBottom: '16px' }}>
        Attendance sheets and other downloadable content are provided "as is" for your personal use. You may not redistribute or commercially exploit such content.
      </Text>

      <Divider style={{ marginTop: '32px', marginBottom: '16px' }} />
      
      <Text style={{ display: 'block', fontWeight: 'bold', marginBottom: '16px' }}>
        By using Colorado Springs Community Service Hub, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
      </Text>
      
      <Text style={{ display: 'block', fontStyle: 'italic', color: '#666' }}>
        Effective Date: December 27, 2025
      </Text>
    </div>
  );
}