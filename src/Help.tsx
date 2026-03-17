import React from "react";
import {
  Card, CardHeader, CardFooter, Button, Text, Title1, Title2, Title3,
  Divider, Accordion, AccordionItem, AccordionHeader, AccordionPanel,
  CardPreview
} from "@fluentui/react-components";
import {
  AddCircle20Regular, Search20Regular, CalendarAdd20Regular,
  Person20Regular, ShieldCheckmark20Regular, BookmarkMultiple20Regular
} from "@fluentui/react-icons";
import { useNavigate } from "react-router-dom";

interface GuideProps {
  onBack: () => void;
  title: string;
  steps: { heading: string; body: string }[];
}

function GuideDetail({ onBack, title, steps }: GuideProps) {
  return (
    <div style={{ maxWidth: "700px" }}>
      <Button appearance="subtle" onClick={onBack} style={{ marginBottom: "16px" }}>
        ← Back to Help
      </Button>
      <Title2 style={{ marginBottom: "8px" }}>{title}</Title2>
      <Divider style={{ marginBottom: "24px" }} />
      <Accordion multiple collapsible defaultOpenItems={steps.map((_, i) => String(i))}>
        {steps.map((step, i) => (
          <AccordionItem key={i} value={String(i)}>
            <AccordionHeader>
              <Text weight="semibold">Step {i + 1}: {step.heading}</Text>
            </AccordionHeader>
            <AccordionPanel>
              <Text>{step.body}</Text>
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

const GUIDES: Record<string, { title: string; steps: { heading: string; body: string }[] }> = {
  "creating-event": {
    title: "Creating an Event",
    steps: [
      {
        heading: "Sign in to your account",
        body: "You must be signed in to create events. Click your name in the top-left corner and select 'Sign In' if you haven't already."
      },
      {
        heading: "Go to My Posts",
        body: "In the left navigation bar, click 'My Posts'. This is your personal dashboard for managing events you've created."
      },
      {
        heading: "Click the + button",
        body: "Click the large circle + icon next to 'Manage Events'. This opens the Create Event dialog."
      },
      {
        heading: "Fill in the event details",
        body: "Enter an event name, description, location (with autocomplete), start and end date/time, and the maximum number of participants. An optional image URL can be added to give your event a banner image."
      },
      {
        heading: "Submit",
        body: "Click 'Create'. Your event will immediately appear on the Posts page and in search results. Anyone can view it and sign up."
      }
    ]
  },
  "signing-up-for-event": {
    title: "Signing Up for an Event",
    steps: [
      {
        heading: "Browse events",
        body: "Go to the Posts page (home) to see all available community service events, ordered by start date."
      },
      {
        heading: "Open an event",
        body: "Click 'View Event' on any event card to open the full event details page."
      },
      {
        heading: "Click Sign Up",
        body: "On the event page, click the 'Sign Up' button in the Participants panel on the right. You must be signed in. If the event is full, the button will say 'Event Full'."
      },
      {
        heading: "You're registered",
        body: "Your name will appear in the participants list. The organizer can now see you and mark your attendance on event day."
      }
    ]
  },
  "attendance": {
    title: "Tracking Attendance (for Organizers)",
    steps: [
      {
        heading: "Open your event",
        body: "Go to the event page for the event you organized. You'll see a 'Manage Attendance' button at the top — only organizers see this."
      },
      {
        heading: "Mark participants as attended",
        body: "In the Attendance Check-In dialog, check the box next to each participant who showed up. This saves their attendance to their profile permanently."
      },
      {
        heading: "Download an attendance sheet",
        body: "In 'My Posts', open the ⋯ menu next to your event and click 'Download Attendance Sheet'. This generates a printable HTML file you can bring on event day for physical sign-in."
      },
      {
        heading: "Attendance is permanent",
        body: "Once you mark someone as attended, that record is saved to their profile and will remain even if you later delete the event."
      }
    ]
  },
  "saving-events": {
    title: "Saving Events",
    steps: [
      {
        heading: "Find an event",
        body: "On the Posts page, find an event you want to save for later."
      },
      {
        heading: "Open the ⋯ menu",
        body: "Click the three-dot menu (⋯) on the event card and select 'Save Post'. The bookmark icon will fill in to confirm."
      },
      {
        heading: "View saved events",
        body: "Go to 'My Posts' and click the 'Saved Events' tab to see everything you've bookmarked."
      }
    ]
  },
  "reporting": {
    title: "Reporting a Post or User",
    steps: [
      {
        heading: "Open the event page",
        body: "Navigate to the event or post you want to report."
      },
      {
        heading: "Open the ⋯ menu next to the organizer",
        body: "On the event page, click ⋯ next to the organizer's name and select 'Report Organizer'. To report a participant, click ⋯ next to their name in the participants list."
      },
      {
        heading: "Select a category and describe the issue",
        body: "Pick the category that best fits (spam, safety concern, inappropriate content, etc.) and provide a description of at least 10 characters."
      },
      {
        heading: "Submit",
        body: "Click 'Submit Report'. Our moderation team will review it. Posts that receive 3 or more reports are automatically hidden until reviewed."
      }
    ]
  },
  "profile": {
    title: "Viewing Your Service History",
    steps: [
      {
        heading: "Go to your Profile",
        body: "Click your name in the top-left corner and select 'Profile'."
      },
      {
        heading: "View the attendance table",
        body: "The 'Event Attendance History' table shows every event where an organizer marked you as attended. The count at the top shows your total confirmed service events."
      },
      {
        heading: "Records persist after deletion",
        body: "If an event is deleted by the organizer, your attendance record is preserved. The event details (title, location, date) are saved to your profile at check-in time for this reason."
      }
    ]
  }
};

type GuideKey = keyof typeof GUIDES;

export function HelpHome() {
  const [activeGuide, setActiveGuide] = React.useState<GuideKey | null>(null);
  const navigate = useNavigate();

  if (activeGuide) {
    const guide = GUIDES[activeGuide];
    return (
      <GuideDetail
        title={guide.title}
        steps={guide.steps}
        onBack={() => setActiveGuide(null)}
      />
    );
  }

  const cards: { key: GuideKey; icon: React.ReactNode; title: string; description: string }[] = [
    {
      key: "creating-event",
      icon: <AddCircle20Regular />,
      title: "Creating an Event",
      description: "How to post a new community service opportunity."
    },
    {
      key: "signing-up-for-event",
      icon: <CalendarAdd20Regular />,
      title: "Signing Up for an Event",
      description: "How to register as a participant."
    },
    {
      key: "attendance",
      icon: <ShieldCheckmark20Regular />,
      title: "Tracking Attendance",
      description: "How organizers mark attendance and download sign-in sheets."
    },
    {
      key: "saving-events",
      icon: <BookmarkMultiple20Regular />,
      title: "Saving Events",
      description: "How to bookmark events to find them later."
    },
    {
      key: "reporting",
      icon: <Search20Regular />,
      title: "Reporting a Post or User",
      description: "How to flag inappropriate or misleading content."
    },
    {
      key: "profile",
      icon: <Person20Regular />,
      title: "Your Service History",
      description: "How to view and understand your attendance record."
    }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", maxWidth: "900px" }}>
      <Title1>Help</Title1>
      <Text style={{ marginTop: "8px", marginBottom: "8px" }}>
        Welcome! Choose a topic below to get step-by-step guidance. If you ever see a site or service asking you to pay for anything related to this platform, it is a scam — this site is completely free.
      </Text>
      <Divider style={{ marginTop: "16px", marginBottom: "24px" }} />

      <Title2 style={{ marginBottom: "16px" }}>Guides</Title2>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
        {cards.map(({ key, icon, title, description }) => (
          <Card
            key={key}
            style={{ width: "280px", maxWidth: "100%", height: "fit-content" }}
          >
            <CardHeader
              header={<Title3>{title}</Title3>}
              description={<Text size={200}>{description}</Text>}
            />
            <CardPreview>{icon}</CardPreview>
            <CardFooter>
              <Button appearance="primary" onClick={() => setActiveGuide(key)}>
                Learn More
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Divider style={{ margin: "32px 0 24px" }} />

      <Title2 style={{ marginBottom: "16px" }}>Frequently Asked Questions</Title2>
      <Accordion collapsible>
        <AccordionItem value="faq-1">
          <AccordionHeader>Is this site free to use?</AccordionHeader>
          <AccordionPanel>
            <Text>Yes, completely free. There are no paid tiers, no subscriptions, and no advertising. If anything claims otherwise, it is not affiliated with this site.</Text>
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem value="faq-2">
          <AccordionHeader>Will my attendance records be accepted by schools or organizations?</AccordionHeader>
          <AccordionPanel>
            <Text>Attendance records here are managed by event organizers, not independently verified. We recommend checking with your school or organization about their requirements. You may need additional documentation from the event organizer directly.</Text>
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem value="faq-3">
          <AccordionHeader>What happens if an event is cancelled or deleted?</AccordionHeader>
          <AccordionPanel>
            <Text>If an organizer deletes an event, any attendance records that were already confirmed (marked as attended) are preserved permanently in participants' profiles. Unconfirmed registrations are removed.</Text>
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem value="faq-4">
          <AccordionHeader>How do I change my display name or password?</AccordionHeader>
          <AccordionPanel>
            <Text>
              Click your name in the top-left corner, then select 'Settings'. You can update your display name, email address, and password from there.
            </Text>
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem value="faq-5">
          <AccordionHeader>I want to contribute to the site. How?</AccordionHeader>
          <AccordionPanel>
            <Text>
              Visit the{" "}
              <Button appearance="transparent" style={{ padding: 0 }} onClick={() => navigate("/contribute")}>
                Contribute page
              </Button>{" "}
              for details on how to get in touch.
            </Text>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </div>
  );
}