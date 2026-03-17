import { useEffect, useState } from 'react';
import { prettyJson } from '../utils/format';

export function JsonEditorModal({ open, title, initialValue, onClose, onSave }) {
  const [text, setText] = useState(prettyJson(initialValue));
  const [error, setError] = useState('');

  useEffect(() => {
    setText(prettyJson(initialValue));
    setError('');
  }, [initialValue, open]);

  if (!open) return null;

  const handleSave = () => {
    try {
      const parsed = JSON.parse(text);
      setError('');
      onSave(parsed);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal card">
        <div className="section-header">
          <div>
            <h3>{title}</h3>
            <p>Edit extracted JSON and rerun the workflow.</p>
          </div>
          <button className="button secondary" onClick={onClose}>Close</button>
        </div>
        <textarea className="json-editor" value={text} onChange={(e) => setText(e.target.value)} rows={16} />
        {error ? <div className="error-text">{error}</div> : null}
        <div className="modal-actions">
          <button className="button secondary" onClick={onClose}>Cancel</button>
          <button className="button primary" onClick={handleSave}>Save & Re-run</button>
        </div>
      </div>
    </div>
  );
}
