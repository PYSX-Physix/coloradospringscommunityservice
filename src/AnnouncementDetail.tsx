import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, LightBulbIcon } from '@heroicons/react/24/outline';
import { getAnnouncementById } from '../functions/api/announcements-data';
import type { AnnouncementSection } from '../functions/api/announcements-data';

function SectionContent({ section }: { section: AnnouncementSection }) {
  switch (section.type) {
    case 'list':
      return (
        <ol className="list-decimal list-inside space-y-1 text-gray-300 text-sm leading-relaxed mb-3">
          {section.items?.map((item, i) => <li key={i}>{item}</li>)}
        </ol>
      );
    case 'tip':
      return (
        <div className="flex items-start gap-3 bg-yellow-900/20 border border-yellow-800/40 rounded-lg p-3 mb-3">
          <LightBulbIcon className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
          <p className="text-sm text-yellow-200 italic">{section.content}</p>
        </div>
      );
    case 'card':
      return (
        <div className="mb-3">
          {section.title && <p className="font-semibold text-white text-sm mb-1">{section.title}</p>}
          <p className="text-gray-300 text-sm">{section.content}</p>
        </div>
      );
    default:
      return <p className="text-gray-300 text-sm mb-3">{section.content}</p>;
  }
}

export default function AnnouncementDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const announcement = getAnnouncementById(id || '');

  if (!announcement) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold text-white mb-2">Announcement Not Found</h1>
        <p className="text-gray-400 mb-4">Sorry, we couldn't find the announcement you're looking for.</p>
        <button onClick={() => navigate('/announcements')} className="btn-primary">Back to Announcements</button>
      </div>
    );
  }

  if (!announcement.hasDetailPage || !announcement.article) {
    navigate('/announcements');
    return null;
  }

  return (
    <div className="max-w-3xl space-y-6">
      <button onClick={() => navigate('/announcements')} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
        <ArrowLeftIcon className="w-4 h-4" /> Back to Announcements
      </button>

      <div>
        <span className="badge bg-blue-900/60 text-blue-300 border border-blue-700/50 mb-3 inline-block">{announcement.version}</span>
        <h1 className="text-3xl font-bold text-white mb-1">{announcement.title}</h1>
        <p className="text-sm text-gray-500">{announcement.date}</p>
      </div>

      <div className="divider" />

      <p className="text-gray-200 text-base leading-relaxed">{announcement.article.intro}</p>

      {announcement.article.sections.map((section, si) => (
        <div key={si}>
          <h2 className="text-xl font-semibold text-white mb-4">{section.title}</h2>
          {section.content.some(c => c.type === 'card') ? (
            <div className="card p-4 space-y-3">
              {section.content.map((c, ci) => <SectionContent key={ci} section={c} />)}
            </div>
          ) : (
            <div>{section.content.map((c, ci) => <SectionContent key={ci} section={c} />)}</div>
          )}
        </div>
      ))}

      <div className="divider" />

      <div className="text-center space-y-3">
        <p className="text-gray-400 text-sm">Have questions or feedback about this update?</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => navigate('/posts')} className="btn-primary">Browse Events</button>
          <button onClick={() => navigate('/announcements')} className="btn-secondary">All Announcements</button>
        </div>
      </div>
    </div>
  );
}