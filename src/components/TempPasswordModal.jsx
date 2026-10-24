import { useState } from 'react';
import { Modal } from './ui/Modal.jsx';
import { Button } from './ui/Common.jsx';

// Temporary password sirf ek baar dikhaya jata hai (backend ise store nahi karta)
export default function TempPasswordModal({ open, onClose, title = 'Temporary password', email, password }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard block ho to user manually copy kar le */
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={title} size="sm" footer={<Button onClick={onClose}>I have saved it</Button>}>
      <p className="text-sm text-slate-600">
        Share this password securely with the user. It is shown <strong>only once</strong>, and the user must change it at first login.
      </p>
      {email && <p className="mt-3 text-sm text-slate-500">Account: <span className="font-medium text-slate-800">{email}</span></p>}
      <div className="mt-3 flex items-center gap-2">
        <code className="flex-1 select-all rounded-lg bg-slate-100 px-3 py-2 font-mono text-base tracking-wide text-slate-900">{password}</code>
        <Button variant="secondary" onClick={copy}>
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>
    </Modal>
  );
}
