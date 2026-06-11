import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusCircleIcon, CalendarDaysIcon, ShieldCheckIcon,
  BookmarkIcon, FlagIcon, UserIcon, ChevronDownIcon, ChevronUpIcon, ArrowLeftIcon,
} from '@heroicons/react/24/outline';

const GUIDES = {
  'creating-event': {
    title: 'Creating an Event',
    icon: PlusCircleIcon,
    description: 'How to post a new community service opportunity.',
    steps: [
      { heading: 'Sign in to your account', body: 'You must be signed in to create events. Click your name in the top-left corner and select "Sign In" if you haven\'t already.' },
      { heading: 'Go to My Posts', body: 'In the left navigation bar, click "My Posts". This is your personal dashboard for managing events you\'ve created.' },
      { heading: 'Click the + button', body: 'Click the large + icon next to "Manage Events". This opens the Create Event dialog.' },
      { heading: 'Fill in the event details', body: 'Enter an event name, description, location (with autocomplete), start and end date/time, and the maximum number of participants. An optional image URL can be added.' },
      { heading: 'Submit', body: 'Click "Create". Your event will immediately appear on the Posts page and in search results.' },
    ],
  },
  'signing-up-for-event': {
    title: 'Signing Up for an Event',
    icon: CalendarDaysIcon,
    description: 'How to register as a participant.',
    steps: [
      { heading: 'Browse events', body: 'Go to the Posts page (home) to see all available community service events, ordered by start date.' },
      { heading: 'Open an event', body: 'Click "View Event" on any event card to open the full event details page.' },
      { heading: 'Click Sign Up', body: 'On the event page, click the "Sign Up" button in the Participants panel. You must be signed in.' },
      { heading: "You're registered", body: 'Your name will appear in the participants list. The organizer can now see you and mark your attendance on event day.' },
    ],
  },
  'attendance': {
    title: 'Tracking Attendance (for Organizers)',
    icon: ShieldCheckIcon,
    description: 'How organizers mark attendance and download sign-in sheets.',
    steps: [
      { heading: 'Open your event', body: 'Go to the event page for the event you organized. You\'ll see a "Manage Attendance" button at the top.' },
      { heading: 'Mark participants as attended', body: 'In the Attendance Check-In dialog, check the box next to each participant who showed up.' },
      { heading: 'Download an attendance sheet', body: 'In "My Posts", open the ⋯ menu and click "Download Attendance Sheet". This generates a printable HTML file.' },
      { heading: 'Attendance is permanent', body: 'Once you mark someone as attended, that record is saved permanently even if you later delete the event.' },
    ],
  },
  'saving-events': {
    title: 'Saving Events',
    icon: BookmarkIcon,
    description: 'How to bookmark events to find them later.',
    steps: [
      { heading: 'Find an event', body: 'On the Posts page, find an event you want to save for later.' },
      { heading: 'Open the ⋯ menu', body: 'Click the three-dot menu (⋯) on the event card and select "Save Post".' },
      { heading: 'View saved events', body: 'Go to "My Posts" and click the "Saved Events" tab to see everything you\'ve bookmarked.' },
    ],
  },
  'reporting': {
    title: 'Reporting a Post or User',
    icon: FlagIcon,
    description: 'How to flag inappropriate or misleading content.',
    steps: [
      { heading: 'Open the event page', body: 'Navigate to the event or post you want to report.' },
      { heading: 'Open the ⋯ menu', body: 'Click ⋯ next to the organizer\'s name and select "Report Organizer". To report a participant, click ⋯ next to their name.' },
      { heading: 'Select a category and describe the issue', body: 'Pick the category that best fits and provide a description of at least 10 characters.' },
      { heading: 'Submit', body: 'Click "Submit Report". Posts that receive 3 or more reports are automatically hidden until reviewed.' },
    ],
  },
  'profile': {
    title: 'Viewing Your Service History',
    icon: UserIcon,
    description: 'How to view and understand your attendance record.',
    steps: [
      { heading: 'Go to your Profile', body: 'Click your name in the top-left corner and select "Profile".' },
      { heading: 'View the attendance table', body: 'The "Event Attendance History" table shows every event where an organizer marked you as attended.' },
      { heading: 'Records persist after deletion', body: 'If an event is deleted by the organizer, your attendance record is preserved.' },
    ],
  },
} as const;

type GuideKey = keyof typeof GUIDES;

const FAQS = [
  { q: 'Is this site free to use?', a: 'Yes, completely free. There are no paid tiers, no subscriptions, and no advertising. If anything claims otherwise, it is not affiliated with this site.' },
  { q: 'Will my attendance records be accepted by schools or organizations?', a: 'Attendance records here are managed by event organizers, not independently verified. We recommend checking with your school or organization about their requirements.' },
  { q: 'What happens if an event is cancelled or deleted?', a: 'If an organizer deletes an event, any attendance records that were already confirmed are preserved permanently in participants\' profiles.' },
  { q: 'How do I change my display name or password?', a: 'Click your name in the top-left corner, then select "Settings". You can update your display name, email address, and password from there.' },
];

function AccordionItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="border-b border-neutral-600 last:border-0">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-4 py-4 text-left">
        <span className="text-sm font-medium text-white">{q}</span>
        {open ? <ChevronUpIcon className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDownIcon className="w-4 h-4 text-gray-400 shrink-0" />}
      </button>
      {open && (
        <div className="px-4 pb-4">
          <p className="text-sm text-gray-400">{a}</p>
        </div>
      )}
    </div>
  );
}

function GuideDetail({ guideKey, onBack }: { guideKey: GuideKey; onBack: () => void }) {
  const guide = GUIDES[guideKey];
  return (
    <div className="max-w-2xl">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-4 transition-colors">
        <ArrowLeftIcon className="w-4 h-4" /> Back to Help
      </button>
      <h2 className="text-2xl font-bold text-white mb-6">{guide.title}</h2>
      <div className="space-y-3">
        {guide.steps.map((step, i) => (
          <div key={i} className="card p-4 flex gap-4">
            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5">
              {i + 1}
            </div>
            <div>
              <p className="font-semibold text-white text-sm mb-1">{step.heading}</p>
              <p className="text-gray-400 text-sm">{step.body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HelpHome() {
  const [activeGuide, setActiveGuide] = React.useState<GuideKey | null>(null);
  const navigate = useNavigate();

  if (activeGuide) return <GuideDetail guideKey={activeGuide} onBack={() => setActiveGuide(null)} />;

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Help</h1>
        <p className="text-gray-400 text-sm">
          Welcome! Choose a topic below to get step-by-step guidance. If anything asks you to pay, it is a scam — this site is completely free.
        </p>
      </div>

      <div className="divider" />

      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Guides</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(Object.entries(GUIDES) as [GuideKey, typeof GUIDES[GuideKey]][]).map(([key, guide]) => {
            const Icon = guide.icon;
            return (
              <div key={key} className="card p-4 flex flex-col gap-3 hover:border-gray-600 transition-colors">
                <div className="w-9 h-9 bg-blue-900/50 rounded-lg flex items-center justify-center">
                  <Icon className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white text-sm">{guide.title}</h3>
                  <p className="text-gray-400 text-xs mt-0.5">{guide.description}</p>
                </div>
                <button onClick={() => setActiveGuide(key)} className="btn-primary text-sm w-full">Learn More</button>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Frequently Asked Questions</h2>
        <div className="card">
          {FAQS.map((faq, i) => <AccordionItem key={i} q={faq.q} a={faq.a} />)}
          <div className="border-t border-gray-700 px-4 py-4">
            <p className="text-sm text-gray-400">
              Want to contribute?{' '}
              <button onClick={() => navigate('/contribute')} className="text-blue-400 hover:underline">
                Visit the Contribute page
              </button>{' '}for details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}