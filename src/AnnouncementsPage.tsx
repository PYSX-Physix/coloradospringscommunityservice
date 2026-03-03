import {
  Card,
  CardHeader,
  Text,
  Badge,
  Divider,
  Button,
  Title1,
  Title3,
  Body1
} from "@fluentui/react-components";
import {
  MegaphoneLoud24Regular,
  ChevronRight20Regular,
  Info20Filled,
  Warning20Filled
} from "@fluentui/react-icons";
import { useNavigate } from "react-router-dom";
import { getAnnouncementsByYear } from '../functions/api/announcements-data';
import type { AnnouncementData } from '../functions/api/announcements-data';

const typeIcons = {
  info: <Info20Filled style={{ color: '#0078D4' }} />,
  warning: <Warning20Filled style={{ color: '#F7630C' }} />
};

const typeColors = {
  info: '#0078D4',
  warning: '#F7630C'
};

function AnnouncementCard({ announcement }: { announcement: AnnouncementData }) {
  const navigate = useNavigate();

  return (
    <Card
      style={{
        marginBottom: '16px',
        cursor: announcement.hasDetailPage ? 'pointer' : 'default'
      }}
      onClick={() => announcement.hasDetailPage && navigate(`/announcements/${announcement.id}`)}
    >
      <CardHeader
        header={
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
            <div style={{ 
              padding: '8px', 
              borderRadius: '8px', 
              backgroundColor: `${typeColors[announcement.type]}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {typeIcons[announcement.type]}
            </div>
            
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <Text weight="semibold" size={400}>{announcement.title}</Text>
                <Badge appearance="tint" color="informative" size="small">
                  {announcement.version}
                </Badge>
              </div>
              <Text size={200} style={{ color: '#666' }}>
                {announcement.date}
              </Text>
            </div>

            {announcement.hasDetailPage && (
              <Button
                appearance="subtle"
                icon={<ChevronRight20Regular />}
                size="small"
              >
                Read More
              </Button>
            )}
          </div>
        }
      />
      
      <div style={{ padding: '0 16px 16px 16px' }}>
        <Text style={{ display: 'block', marginBottom: '12px' }}>
          {announcement.message}
        </Text>

        {announcement.items && announcement.items.length > 0 && (
          <ul style={{ margin: '0', paddingLeft: '20px' }}>
            {announcement.items.map((item, index) => (
              <li key={index} style={{ marginBottom: '4px' }}>
                <Text size={300}>{item}</Text>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}

function AnnouncementsPage() {
  const announcementsByYear = getAnnouncementsByYear();
  const years = Object.keys(announcementsByYear).sort((a, b) => parseInt(b) - parseInt(a));

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
        <MegaphoneLoud24Regular style={{ fontSize: '32px', color: '#0078D4' }} />
        <Title1>Announcements & Updates</Title1>
      </div>
      
      <Body1 style={{ marginBottom: '32px', color: '#666' }}>
        Stay up to date with the latest features, improvements, and changes to the Colorado Springs Community Service Hub.
      </Body1>

      <Divider style={{ marginBottom: '32px' }} />

      {years.map(year => (
        <div key={year} style={{ marginBottom: '48px' }}>
          <Title3 style={{ marginBottom: '16px', color: '#0078D4' }}>{year}</Title3>
          
          {announcementsByYear[year].map(announcement => (
            <AnnouncementCard key={announcement.id} announcement={announcement} />
          ))}
        </div>
      ))}

      <Divider style={{ margin: '32px 0' }} />
      
      <div style={{ 
        textAlign: 'center', 
        padding: '24px',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px'
      }}>
        <Text size={300} style={{ color: '#666' }}>
          Have feedback or suggestions? Let us know how we can improve the platform.
        </Text>
      </div>
    </div>
  );
}

export default AnnouncementsPage;