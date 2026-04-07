import React from 'react';
import {
  Title1,
  Title2,
  Title3,
  Body1,
  Text,
  Badge,
  Divider,
  Card,
  Button
} from "@fluentui/react-components";
import {
  ArrowLeft20Regular,
  Lightbulb20Filled
} from "@fluentui/react-icons";
import { useNavigate, useParams } from "react-router-dom";
import { getAnnouncementById } from '../functions/api/announcements-data';
import type { AnnouncementSection } from '../functions/api/announcements-data';

function SectionContent({ section }: { section: AnnouncementSection }) {
  switch (section.type) {
    case 'card':
      return (
        <div style={{ marginBottom: '16px' }}>
          {section.title && <Title3 style={{ marginBottom: '8px' }}>{section.title}</Title3>}
          <Body1>{section.content}</Body1>
        </div>
      );
    
    case 'list':
      return (
        <ol style={{ paddingLeft: '24px', lineHeight: '1.8', marginBottom: '16px' }}>
          {section.items?.map((item, index) => (
            <li key={index}>
              <Body1>{item}</Body1>
            </li>
          ))}
        </ol>
      );
    
    case 'tip':
      return (
        <Card style={{ padding: '16px', backgroundColor: '#FFF4CE', marginBottom: '16px', border: '1px solid #F7B955' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <Lightbulb20Filled style={{ color: '#F7B955', marginTop: '2px' }} />
            <Body1 style={{ fontStyle: 'italic' }}>{section.content}</Body1>
          </div>
        </Card>
      );
    
    case 'text':
    default:
      return (
        <Body1 style={{ marginBottom: '16px' }}>
          {section.content}
        </Body1>
      );
  }
}

function AnnouncementDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const announcement = getAnnouncementById(id || '');

  if (!announcement) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px', textAlign: 'center' }}>
        <Title1 style={{ marginBottom: '16px' }}>Announcement Not Found</Title1>
        <Body1 style={{ marginBottom: '24px' }}>
          Sorry, we couldn't find the announcement you're looking for.
        </Body1>
        <Button
          appearance="primary"
          onClick={() => navigate('/announcements')}
        >
          Back to Announcements
        </Button>
      </div>
    );
  }

  if (!announcement.hasDetailPage || !announcement.article) {
    navigate('/announcements');
    return null;
  }

  const badgeColor = announcement.type === 'warning' ? 'warning' : 'informative';

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
      {/* Back button */}
      <Button
        appearance="subtle"
        icon={<ArrowLeft20Regular />}
        onClick={() => navigate('/announcements')}
        style={{ marginBottom: '24px' }}
      >
        Back to Announcements
      </Button>

      {/* Header */}
      <div style={{ marginBottom: '16px' }}>
        <Badge appearance="tint" color={badgeColor} size="large" style={{ marginBottom: '12px' }}>
          {announcement.version}
        </Badge>
        <Title1 style={{ marginBottom: '8px' }}>{announcement.title}</Title1>
        <Text size={300} style={{ color: '#666' }}>
          {announcement.date}
        </Text>
      </div>

      <Divider style={{ margin: '24px 0' }} />

      {/* Introduction */}
      <Body1 style={{ marginBottom: '32px', fontSize: '18px', lineHeight: '1.6' }}>
        {announcement.article.intro}
      </Body1>

      {/* Article Sections */}
      {announcement.article.sections.map((section, sectionIndex) => (
        <div key={sectionIndex} style={{ marginBottom: '32px' }}>
          <Title2 style={{ marginBottom: '16px' }}>{section.title}</Title2>
          
          {section.content.some(c => c.type === 'card') ? (
            <Card style={{ padding: '24px', marginBottom: '16px' }}>
              {section.content.map((content, contentIndex) => (
                <React.Fragment key={contentIndex}>
                  <SectionContent section={content} />
                  {contentIndex < section.content.length - 1 && content.type === 'card' && (
                    <Divider style={{ margin: '16px 0' }} />
                  )}
                </React.Fragment>
              ))}
            </Card>
          ) : (
            <div style={{ marginBottom: '16px' }}>
              {section.content.map((content, contentIndex) => (
                <SectionContent key={contentIndex} section={content} />
              ))}
            </div>
          )}
        </div>
      ))}

      <Divider style={{ margin: '32px 0' }} />

      {/* Footer */}
      <div style={{ textAlign: 'center' }}>
        <Body1 style={{ color: '#666', marginBottom: '16px' }}>
          Have questions or feedback about this update?
        </Body1>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Button
            appearance="primary"
            onClick={() => navigate('/posts')}
          >
            Browse Events
          </Button>
          <Button
            appearance="secondary"
            onClick={() => navigate('/announcements')}
          >
            All Announcements
          </Button>
        </div>
      </div>
    </div>
  );
}

export default AnnouncementDetail;