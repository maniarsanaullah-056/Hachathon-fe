import { useState } from 'react';
import { Megaphone, Plus, Bell, Calendar, User, CheckCircle2 } from 'lucide-react';
import useFetch from '../hooks/useFetch.js';
import { commsApi } from '../services/hcmServices.js';
import { useAuth } from '../context/AuthContext.jsx';
import { ROLES } from '../utils/roles.js';
import { PageHeader, Badge, Button, Card, ErrorBanner, EmptyState } from '../components/ui/Common.jsx';
import Modal from '../components/ui/Modal.jsx';
import { Input, Textarea, Select } from '../components/ui/Field.jsx';
import { formatDate } from '../utils/format.js';
import { useToast } from '../context/ToastContext.jsx';

export default function AnnouncementsPage() {
  const toast = useToast();
  const { user } = useAuth();
  const canPost = user?.role === ROLES.ADMIN || user?.role === ROLES.HR;

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState('normal');
  const [submitting, setSubmitting] = useState(false);

  const { data: commsData, loading, error, reload } = useFetch(
    () => commsApi.getAnnouncements(),
    []
  );

  const announcements = commsData?.announcements || commsData?.items || commsData || [];

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSubmitting(true);
    try {
      await commsApi.createAnnouncement({ title, content, priority });
      toast.success('Announcement broadcasted to all employees');
      setCreateModalOpen(false);
      setTitle('');
      setContent('');
      reload();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post announcement');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Company Announcements"
        description="Official updates, company policies, town hall notices and holiday bulletins."
        actions={
          canPost && (
            <Button onClick={() => setCreateModalOpen(true)}>
              <Plus className="h-4 w-4" />
              <span>Post Announcement</span>
            </Button>
          )
        }
      />

      <ErrorBanner message={error} onRetry={reload} />

      {!loading && announcements.length === 0 ? (
        <EmptyState
          title="No announcements"
          message="There are no company broadcasts at this time."
          action={canPost && <Button onClick={() => setCreateModalOpen(true)}>Post First Announcement</Button>}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {announcements.map((a) => (
            <div
              key={a._id}
              className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Badge tone={a.priority === 'high' ? 'red' : 'indigo'}>
                    {(a.priority || 'Normal').toUpperCase()}
                  </Badge>
                  <span className="text-[10px] text-slate-400">{formatDate(a.createdAt)}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Megaphone className="h-4 w-4 text-teal-500" />
                  {a.title}
                </h3>
                <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 whitespace-pre-wrap leading-relaxed">
                  {a.content}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>Posted by {a.author?.name || 'Management'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post Modal */}
      <Modal open={createModalOpen} onClose={() => setCreateModalOpen(false)} title="New Announcement">
        <form onSubmit={handleCreate} className="space-y-4 pt-1">
          <Input
            label="Announcement Title *"
            placeholder="e.g. Annual Company Town Hall 2026"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <Select
            label="Priority Level"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="normal">Normal</option>
            <option value="high">High (Urgent Banner)</option>
          </Select>

          <Textarea
            label="Message Body *"
            placeholder="Type your message to all company staff..."
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              Broadcast to All Staff
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
