import React from 'react';
import { useSession } from '../lib/auth-client';
import { useNavigate } from 'react-router-dom';
import {
  MegaphoneIcon, PlusCircleIcon, EllipsisHorizontalIcon,
  PencilIcon, TrashIcon, EyeIcon, EyeSlashIcon,
  ArrowLeftIcon, LightBulbIcon, CheckCircleIcon, XCircleIcon,
} from '@heroicons/react/24/outline';
import { Dialog } from '../components/Dialog';
import { MenuPortal, MenuItemButton, MenuDivider } from '../components/Menu';
import type { AnnouncementData, AnnouncementArticle, AnnouncementSection } from '../../functions/api/announcements-data';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DraftState {
  id: string;
  version: string;
  date: string;
  title: string;
  type: 'info' | 'warning';
  message: string;
  items: string[];
  dismissible: boolean;
  hasDetailPage: boolean;
  published: boolean;
  article: AnnouncementArticle;
}

const emptyDraft = (): DraftState => ({
  id: '', version: '', date: '', title: '', type: 'info',
  message: '', items: [], dismissible: true,
  hasDetailPage: false, published: true,
  article: { intro: '', sections: [] },
});

function toDraft(a: AnnouncementData): DraftState {
  return {
    id: a.id, version: a.version, date: a.date, title: a.title,
    type: a.type, message: a.message, items: a.items ?? [],
    dismissible: a.dismissible ?? true, hasDetailPage: a.hasDetailPage,
    published: a.published ?? true,
    article: a.article ?? { intro: '', sections: [] },
  };
}

function slugify(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const months = ['january','february','march','april','may','june','july','august','september','october','november','december'];
  return `${months[d.getMonth()]}-${d.getDate()}-${d.getFullYear()}`;
}

// ─── Action menu per row ──────────────────────────────────────────────────────

function ActionMenu({ onEdit, onToggle, onDelete, published }: {
  onEdit: () => void; onToggle: () => void;
  onDelete: () => void; published: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  return (
    <>
      <button ref={triggerRef} onClick={() => setOpen(!open)} className="btn-ghost p-1.5">
        <EllipsisHorizontalIcon className="w-5 h-5" />
      </button>
      <MenuPortal open={open} onClose={() => setOpen(false)} triggerRef={triggerRef} width={192}>
        <div onClick={() => setOpen(false)}>
          <MenuItemButton icon={PencilIcon} onClick={onEdit}>Edit</MenuItemButton>
          <MenuItemButton icon={published ? EyeSlashIcon : EyeIcon} onClick={onToggle}>
            {published ? 'Unpublish' : 'Publish'}
          </MenuItemButton>
          <MenuDivider />
          <MenuItemButton icon={TrashIcon} danger onClick={onDelete}>Delete</MenuItemButton>
        </div>
      </MenuPortal>
    </>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminAnnouncements() {
  const { data: session, isPending } = useSession();
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = React.useState<AnnouncementData[] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [editing, setEditing] = React.useState<DraftState | null>(null);
  const [isNew, setIsNew] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<AnnouncementData | null>(null);

  React.useEffect(() => {
    if (!isPending && !session) { navigate('/auth'); return; }
    if (session?.user && !(session.user as any).isAdmin) { navigate('/'); return; }
  }, [session, isPending, navigate]);

  const load = React.useCallback(() => {
    setLoading(true);
    fetch('/api/announcements?all=1', { credentials: 'include' })
      .then(r => r.ok ? r.json() : Promise.reject(r))
      .then((d: { announcements: AnnouncementData[] }) => setAnnouncements(d.announcements ?? []))
      .catch(() => setAnnouncements([]))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    if (session?.user && (session.user as any).isAdmin) load();
  }, [session, load]);

  const togglePublished = async (a: AnnouncementData) => {
    await fetch(`/api/announcements/${a.id}`, {
      method: 'PUT', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !a.published }),
    });
    load();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await fetch(`/api/announcements/${deleteTarget.id}`, { method: 'DELETE', credentials: 'include' });
    setDeleteTarget(null);
    load();
  };

  if (isPending) return (
    <div className="flex justify-center mt-12">
      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!session || !(session.user as any).isAdmin) return null;

  // Show editor
  if (editing) {
    return (
      <AnnouncementEditor
        draft={editing}
        setDraft={setEditing}
        isNew={isNew}
        onSaved={() => { setEditing(null); load(); }}
        onCancel={() => setEditing(null)}
      />
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <MegaphoneIcon className="w-8 h-8 text-blue-400" />
          <h1 className="text-3xl font-bold text-white">Manage Announcements</h1>
        </div>
        <button onClick={() => { setIsNew(true); setEditing(emptyDraft()); }} className="btn-primary flex items-center gap-2">
          <PlusCircleIcon className="w-5 h-5" /> New Announcement
        </button>
      </div>

      <div className="divider" />

      {loading && (
        <div className="flex justify-center py-8">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && announcements?.length === 0 && (
        <p className="text-gray-400">No announcements yet. Create one to get started.</p>
      )}

      {!loading && announcements && announcements.length > 0 && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="table-header">Title</th>
                <th className="table-header">Version</th>
                <th className="table-header">Date</th>
                <th className="table-header">Type</th>
                <th className="table-header">Status</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {announcements.map(a => (
                <tr key={a.id} className="border-b border-gray-700/50 hover:bg-gray-800/30 transition-colors">
                  <td className="table-cell text-white font-medium">{a.title}</td>
                  <td className="table-cell">
                    <span className="badge bg-blue-900/60 text-blue-300 border border-blue-700/50">{a.version}</span>
                  </td>
                  <td className="table-cell text-gray-400">{a.date}</td>
                  <td className="table-cell">
                    <span className={`badge ${a.type === 'warning' ? 'bg-yellow-900/60 text-yellow-300 border border-yellow-700/50' : 'bg-gray-700 text-gray-300 border border-gray-600'}`}>
                      {a.type}
                    </span>
                  </td>
                  <td className="table-cell">
                    {a.published ? (
                      <span className="badge bg-green-900/60 text-green-300 border border-green-700/50">Published</span>
                    ) : (
                      <span className="badge bg-gray-700 text-gray-400 border border-gray-600">Draft</span>
                    )}
                  </td>
                  <td className="table-cell">
                    <ActionMenu
                      published={!!a.published}
                      onEdit={() => { setIsNew(false); setEditing(toDraft(a)); }}
                      onToggle={() => togglePublished(a)}
                      onDelete={() => setDeleteTarget(a)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete confirmation */}
      <Dialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Announcement?"
        footer={
          <>
            <button onClick={() => setDeleteTarget(null)} className="btn-secondary">Cancel</button>
            <button onClick={handleDelete} className="btn-danger">Delete</button>
          </>
        }
      >
        <p className="text-gray-300 text-sm">
          Are you sure you want to delete <strong className="text-white">"{deleteTarget?.title}"</strong>?
          This cannot be undone.
        </p>
      </Dialog>
    </div>
  );
}

// ─── Editor ───────────────────────────────────────────────────────────────────

function AnnouncementEditor({ draft, setDraft, isNew, onSaved, onCancel }: {
  draft: DraftState;
  setDraft: (d: DraftState) => void;
  isNew: boolean;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [manualId, setManualId] = React.useState(!isNew);

  const set = <K extends keyof DraftState>(key: K, value: DraftState[K]) =>
    setDraft({ ...draft, [key]: value });

  const onDateChange = (val: string) => {
    const next = { ...draft, date: val };
    if (!manualId) {
      const slug = slugify(val);
      if (slug) next.id = slug;
    }
    setDraft(next);
  };

  const save = async () => {
    setSaving(true);
    setSaveError(null);
    const body = {
      id: draft.id,
      version: draft.version,
      date: draft.date,
      title: draft.title,
      type: draft.type,
      message: draft.message,
      items: draft.items.filter(i => i.trim()),
      dismissible: draft.dismissible,
      hasDetailPage: draft.hasDetailPage,
      published: draft.published,
      article: draft.hasDetailPage ? draft.article : undefined,
    };

    try {
      const res = await fetch(
        isNew ? '/api/announcements' : `/api/announcements/${draft.id}`,
        {
          method: isNew ? 'POST' : 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error || `Request failed (${res.status})`);
      }
      onSaved();
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  // Items helpers
  const addItem = () => set('items', [...draft.items, '']);
  const updateItem = (i: number, v: string) => {
    const items = [...draft.items]; items[i] = v; set('items', items);
  };
  const removeItem = (i: number) => set('items', draft.items.filter((_, idx) => idx !== i));

  // Section helpers
  const addSection = () => set('article', {
    ...draft.article,
    sections: [...draft.article.sections, { title: '', content: [] }],
  });
  const updateSection = (si: number, section: { title: string; content: AnnouncementSection[] }) => {
    const sections = [...draft.article.sections]; sections[si] = section;
    set('article', { ...draft.article, sections });
  };
  const removeSection = (si: number) => set('article', {
    ...draft.article,
    sections: draft.article.sections.filter((_, idx) => idx !== si),
  });

  return (
    <div className="max-w-3xl space-y-6">
      <button onClick={onCancel} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
        <ArrowLeftIcon className="w-4 h-4" /> Back
      </button>

      <h1 className="text-2xl font-bold text-white">
        {isNew ? 'New Announcement' : `Editing: ${draft.title || draft.id}`}
      </h1>

      {saveError && (
        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-900/20 border border-red-700/50 rounded-lg px-3 py-2">
          <XCircleIcon className="w-4 h-4 shrink-0" /> {saveError}
        </div>
      )}

      {/* Basic info */}
      <div className="card p-5 space-y-3">
        <h2 className="text-lg font-semibold text-white">Basic info</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Date</label>
            <input className="input" placeholder="June 12, 2026" value={draft.date}
              onChange={e => onDateChange(e.target.value)} />
          </div>
          <div>
            <label className="label">ID (slug)</label>
            <input className="input" placeholder="june-12-2026" value={draft.id}
              disabled={!isNew}
              onChange={e => { setManualId(true); set('id', e.target.value); }} />
            {!isNew && <p className="text-xs text-gray-500 mt-1">ID cannot be changed after creation.</p>}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Version</label>
            <input className="input" placeholder="1.9.0" value={draft.version}
              onChange={e => set('version', e.target.value)} />
          </div>
          <div>
            <label className="label">Type</label>
            <select className="input" value={draft.type}
              onChange={e => set('type', e.target.value as 'info' | 'warning')}>
              <option value="info">info</option>
              <option value="warning">warning</option>
            </select>
          </div>
        </div>
        <div>
          <label className="label">Title</label>
          <input className="input" placeholder="New Feature: Something Great" value={draft.title}
            onChange={e => set('title', e.target.value)} />
        </div>
        <div>
          <label className="label">Message</label>
          <textarea className="input min-h-[80px] resize-y" placeholder="Short summary shown in the banner and popover…"
            value={draft.message} onChange={e => set('message', e.target.value)} />
        </div>
        <div className="flex gap-6 items-center pt-1 flex-wrap">
          <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
            <input type="checkbox" className="accent-blue-500" checked={draft.dismissible}
              onChange={e => set('dismissible', e.target.checked)} /> Dismissible
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
            <input type="checkbox" className="accent-blue-500" checked={draft.published}
              onChange={e => set('published', e.target.checked)} /> Published
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
            <input type="checkbox" className="accent-blue-500" checked={draft.hasDetailPage}
              onChange={e => set('hasDetailPage', e.target.checked)} /> Has detail page
          </label>
        </div>
      </div>

      {/* Highlight items */}
      <div className="card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Highlight items</h2>
          <button onClick={addItem} className="btn-secondary text-sm">+ Item</button>
        </div>
        {draft.items.length === 0 && <p className="text-xs text-gray-500">No items yet.</p>}
        <div className="space-y-2">
          {draft.items.map((item, i) => (
            <div key={i} className="flex gap-2">
              <input className="input flex-1" placeholder="Bullet point text" value={item}
                onChange={e => updateItem(i, e.target.value)} />
              <button onClick={() => removeItem(i)} className="btn-ghost px-3 text-red-400 hover:text-red-300">✕</button>
            </div>
          ))}
        </div>
      </div>

      {/* Article */}
      {draft.hasDetailPage && (
        <div className="card p-5 space-y-3">
          <h2 className="text-lg font-semibold text-white">Article</h2>
          <div>
            <label className="label">Intro paragraph</label>
            <textarea className="input min-h-[80px] resize-y" placeholder="Introductory paragraph for the article…"
              value={draft.article.intro}
              onChange={e => set('article', { ...draft.article, intro: e.target.value })} />
          </div>
          <div className="flex items-center justify-between pt-1">
            <label className="label !mb-0">Sections</label>
            <button onClick={addSection} className="btn-secondary text-sm">+ Section</button>
          </div>
          {draft.article.sections.length === 0 && (
            <p className="text-xs text-gray-500">No sections yet.</p>
          )}
          <div className="space-y-3">
            {draft.article.sections.map((section, si) => (
              <SectionEditor key={si} section={section}
                onChange={(s) => updateSection(si, s)}
                onRemove={() => removeSection(si)} />
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3 justify-end">
        <button onClick={onCancel} className="btn-secondary">Cancel</button>
        <button onClick={save} disabled={saving} className="btn-primary flex items-center gap-2 disabled:opacity-60">
          {saving
            ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Saving…</>
            : <><CheckCircleIcon className="w-4 h-4" /> {isNew ? 'Create' : 'Save changes'}</>}
        </button>
      </div>
    </div>
  );
}

// ─── Section editor ───────────────────────────────────────────────────────────

function SectionEditor({ section, onChange, onRemove }: {
  section: { title: string; content: AnnouncementSection[] };
  onChange: (s: { title: string; content: AnnouncementSection[] }) => void;
  onRemove: () => void;
}) {
  const addBlock = (type: AnnouncementSection['type']) => {
    const block: AnnouncementSection = type === 'list'
      ? { type, items: [''] }
      : type === 'card'
        ? { type, title: '', content: '' }
        : { type, content: '' };
    onChange({ ...section, content: [...section.content, block] });
  };
  const updateBlock = (bi: number, b: AnnouncementSection) => {
    const content = [...section.content]; content[bi] = b;
    onChange({ ...section, content });
  };
  const removeBlock = (bi: number) =>
    onChange({ ...section, content: section.content.filter((_, i) => i !== bi) });

  return (
    <div className="border border-gray-700 rounded-xl p-3 space-y-2 bg-gray-900/30">
      <div className="flex gap-2 items-center">
        <input className="input flex-1" placeholder="Section title (leave blank for closing paragraph)"
          value={section.title} onChange={e => onChange({ ...section, title: e.target.value })} />
        <button onClick={onRemove} className="btn-ghost px-3 text-red-400 hover:text-red-300 whitespace-nowrap text-sm">Remove</button>
      </div>
      <div className="space-y-2">
        {section.content.map((block, bi) => (
          <BlockEditor key={bi} block={block}
            onChange={b => updateBlock(bi, b)}
            onRemove={() => removeBlock(bi)} />
        ))}
      </div>
      <div className="flex gap-2 pt-1 flex-wrap">
        {(['text', 'list', 'card', 'tip'] as const).map(t => (
          <button key={t} onClick={() => addBlock(t)} className="btn-secondary text-xs">+ {t}</button>
        ))}
      </div>
    </div>
  );
}

// ─── Block editor ─────────────────────────────────────────────────────────────

function BlockEditor({ block, onChange, onRemove }: {
  block: AnnouncementSection;
  onChange: (b: AnnouncementSection) => void;
  onRemove: () => void;
}) {
  const tagColors: Record<string, string> = {
    text: 'bg-blue-900/40 text-blue-300',
    list: 'bg-purple-900/40 text-purple-300',
    card: 'bg-green-900/40 text-green-300',
    tip: 'bg-yellow-900/40 text-yellow-300',
  };

  const changeType = (type: AnnouncementSection['type']) => {
    const next: AnnouncementSection = type === 'list'
      ? { type, items: [''] }
      : type === 'card'
        ? { type, title: '', content: '' }
        : { type, content: '' };
    onChange(next);
  };

  return (
    <div className="border border-gray-800 rounded-lg p-2.5 space-y-2 bg-gray-800/40">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={`text-[10px] uppercase font-bold tracking-wide px-2 py-0.5 rounded-full ${tagColors[block.type]}`}>
            {block.type}
          </span>
          <select className="input !w-auto !py-1 !px-2 text-xs" value={block.type}
            onChange={e => changeType(e.target.value as AnnouncementSection['type'])}>
            {(['text', 'list', 'card', 'tip'] as const).map(t =>
              <option key={t} value={t}>{t}</option>
            )}
          </select>
        </div>
        <button onClick={onRemove} className="btn-ghost px-2 text-xs text-red-400 hover:text-red-300">Remove</button>
      </div>

      {(block.type === 'text' || block.type === 'tip') && (
        <div className="flex items-start gap-2">
          {block.type === 'tip' && <LightBulbIcon className="w-4 h-4 text-yellow-400 shrink-0 mt-2" />}
          <textarea className="input min-h-[60px] resize-y flex-1"
            placeholder={block.type === 'tip' ? 'Tip text…' : 'Paragraph text…'}
            value={block.content ?? ''}
            onChange={e => onChange({ ...block, content: e.target.value })} />
        </div>
      )}

      {block.type === 'card' && (
        <>
          <input className="input" placeholder="Card title" value={block.title ?? ''}
            onChange={e => onChange({ ...block, title: e.target.value })} />
          <textarea className="input min-h-[60px] resize-y" placeholder="Card body…"
            value={block.content ?? ''}
            onChange={e => onChange({ ...block, content: e.target.value })} />
        </>
      )}

      {block.type === 'list' && (
        <div className="space-y-2">
          {(block.items ?? []).map((item, ii) => (
            <div key={ii} className="flex gap-2">
              <input className="input flex-1" placeholder="List item" value={item}
                onChange={e => {
                  const items = [...(block.items ?? [])]; items[ii] = e.target.value;
                  onChange({ ...block, items });
                }} />
              <button onClick={() => onChange({ ...block, items: (block.items ?? []).filter((_, i) => i !== ii) })}
                className="btn-ghost px-3 text-red-400 hover:text-red-300">✕</button>
            </div>
          ))}
          <button onClick={() => onChange({ ...block, items: [...(block.items ?? []), ''] })}
            className="btn-secondary text-xs">+ List item</button>
        </div>
      )}
    </div>
  );
}
