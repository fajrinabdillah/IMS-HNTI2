// Extracted from App.jsx during modular refactor.
import React from 'react';
import { Check, FileText, X } from 'lucide-react';
import { showToast } from '../utils/toast.js';
function DocumentEditorModal({ open, onClose, title, initialHtml, docType, record = {}, onSave, saveLabel, lang = 'id', templateMode = false }) {
  const editorRef = React.useRef(null);
  const [dirty, setDirty] = React.useState(false);
  const [selectedImg, setSelectedImg] = React.useState(null); // <img> yang sedang dipilih utk resize/align
  const [documentContent, setDocumentContent] = React.useState('');

  const normalizeEditorHtml = (html) => (html == null ? '' : String(html));
  const isEditorVisuallyEmpty = (el) => {
    if (!el) return true;
    return !el.textContent?.trim() && !el.querySelector('img');
  };
  const readEditorHtml = (el) => {
    if (!el) return normalizeEditorHtml(documentContent);
    return isEditorVisuallyEmpty(el) ? '' : (el.innerHTML ?? '');
  };
  const writeEditorHtml = (el, html) => {
    if (!el) return;
    const safe = normalizeEditorHtml(html);
    el.innerHTML = safe || (templateMode ? '<br>' : '');
    setDocumentContent(safe);
  };
  const ensureEditorCaret = () => {
    const el = editorRef.current;
    if (!el || typeof document === 'undefined') return;
    if (!isEditorVisuallyEmpty(el)) return;
    if (el.innerHTML === '') el.innerHTML = '<br>';
    const range = document.createRange();
    const sel = window.getSelection();
    range.selectNodeContents(el);
    range.collapse(true);
    sel?.removeAllRanges();
    sel?.addRange(range);
  };

  // Muat initialHtml ke editor saat modal dibuka / template berubah
  React.useEffect(() => {
    if (open && editorRef.current) {
      writeEditorHtml(editorRef.current, initialHtml);
      setDirty(false);
      setSelectedImg(null);
    }
    if (!open) setDocumentContent('');
  }, [open, initialHtml, templateMode]);

  // POIN 2: klik gambar → pilih utk resize/align. Klik di luar → batal pilih.
  React.useEffect(() => {
    if (!open) return;
    const el = editorRef.current;
    if (!el) return;
    const onClick = (e) => {
      if (e.target && e.target.tagName === 'IMG') {
        setSelectedImg(e.target);
        e.target.style.outline = '2px dashed #5b8def';
      } else {
        // batal pilih: hapus outline semua img
        el.querySelectorAll('img').forEach(img => { img.style.outline = ''; });
        setSelectedImg(null);
      }
    };
    el.addEventListener('click', onClick);
    return () => el.removeEventListener('click', onClick);
  }, [open]);

  // Resize gambar terpilih (persen lebar relatif natural / step)
  const resizeSelectedImg = (deltaPct) => {
    if (!selectedImg) return;
    const cur = selectedImg.style.width ? parseFloat(selectedImg.style.width) : (selectedImg.width / (selectedImg.naturalWidth || selectedImg.width) * 100 || 100);
    const next = Math.max(10, Math.min(100, (isNaN(cur) ? 100 : cur) + deltaPct));
    selectedImg.style.width = next + '%';
    selectedImg.style.height = 'auto';
    setDirty(true);
  };
  const setImgWidthPx = (px) => {
    if (!selectedImg) return;
    selectedImg.style.width = px + 'px';
    selectedImg.style.height = 'auto';
    setDirty(true);
  };
  const alignSelectedImg = (align) => {
    if (!selectedImg) return;
    selectedImg.style.display = 'block';
    if (align === 'left') { selectedImg.style.marginLeft = '0'; selectedImg.style.marginRight = 'auto'; }
    else if (align === 'center') { selectedImg.style.marginLeft = 'auto'; selectedImg.style.marginRight = 'auto'; }
    else if (align === 'right') { selectedImg.style.marginLeft = 'auto'; selectedImg.style.marginRight = '0'; }
    setDirty(true);
  };

  if (!open) return null;

  const exec = (command, value = null) => {
    if (typeof document === 'undefined') return;
    document.execCommand(command, false, value);
    editorRef.current && editorRef.current.focus();
    setDirty(true);
  };

  const getHtml = () => readEditorHtml(editorRef.current);

  const handleEditorInput = () => {
    const el = editorRef.current;
    if (!el) return;
    setDocumentContent(readEditorHtml(el));
    setDirty(true);
  };

  const handleEditorPaste = () => {
    // Biarkan paste bawaan browser (Word, dll.) — jangan preventDefault.
    requestAnimationFrame(() => {
      const el = editorRef.current;
      if (!el) return;
      setDocumentContent(readEditorHtml(el));
      setDirty(true);
    });
  };

  const handleSave = (status) => {
    const html = normalizeEditorHtml(getHtml());
    if (!html.trim()) {
      showToast(lang === 'id' ? 'Dokumen kosong' : 'Document is empty', 'error');
      return;
    }
    onSave && onSave(html, status);
  };

  const insertImagePrompt = () => {
    const url = window.prompt(lang === 'id' ? 'Tempel URL gambar (atau biarkan kosong):' : 'Paste image URL:');
    if (url) exec('insertImage', url);
  };

  const toolbarBtn = (label, cmd, val, title) => (
    <button type="button" onMouseDown={(e) => { e.preventDefault(); exec(cmd, val); }} title={title || label}
      style={{minWidth: '32px', height: '30px', padding: '0 8px', background: 'var(--ims-bg-card-2)', border: '1px solid var(--ims-border)', color: 'var(--ims-text)', cursor: 'pointer', fontFamily: 'inherit', fontSize: '12px', fontWeight: 700}}>
      {label}
    </button>
  );

  return (
    <div style={{position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 4000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'}} onClick={onClose}>
      <div style={{background: 'var(--ims-bg-card)', border: '1px solid var(--ims-border)', width: 'min(960px, 96vw)', maxHeight: '94vh', display: 'flex', flexDirection: 'column'}} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{padding: '14px 18px', borderBottom: '1px solid var(--ims-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div>
            <div style={{fontSize: '14px', fontWeight: 700, color: 'var(--ims-text)'}}>{title || (lang === 'id' ? 'Editor Dokumen' : 'Document Editor')}</div>
            <div style={{fontSize: '11px', color: 'var(--ims-text-2)', marginTop: '2px'}}>{record.customer || ''} {record.sphNo ? `· ${record.sphNo}` : ''}</div>
          </div>
          <button onClick={onClose} className="btn-ghost" style={{fontSize: '11px'}}><X size={14} />{lang === 'id' ? 'Tutup' : 'Close'}</button>
        </div>

        {/* Toolbar */}
        <div style={{padding: '8px 18px', borderBottom: '1px solid var(--ims-border)', display: 'flex', gap: '4px', flexWrap: 'wrap', alignItems: 'center', background: 'var(--ims-bg)'}}>
          {toolbarBtn('B', 'bold', null, 'Bold')}
          {toolbarBtn('I', 'italic', null, 'Italic')}
          {toolbarBtn('U', 'underline', null, 'Underline')}
          <span style={{width: '1px', height: '20px', background: 'var(--ims-border)', margin: '0 4px'}} />
          {toolbarBtn('H1', 'formatBlock', '<h1>', 'Heading 1')}
          {toolbarBtn('H2', 'formatBlock', '<h2>', 'Heading 2')}
          {toolbarBtn('H3', 'formatBlock', '<h3>', 'Heading 3')}
          {toolbarBtn('P', 'formatBlock', '<p>', 'Paragraph')}
          <span style={{width: '1px', height: '20px', background: 'var(--ims-border)', margin: '0 4px'}} />
          {toolbarBtn('• List', 'insertUnorderedList', null, 'Bullet list')}
          {toolbarBtn('1. List', 'insertOrderedList', null, 'Numbered list')}
          <span style={{width: '1px', height: '20px', background: 'var(--ims-border)', margin: '0 4px'}} />
          {toolbarBtn('⬅', 'justifyLeft', null, 'Align left')}
          {toolbarBtn('⬌', 'justifyCenter', null, 'Align center')}
          {toolbarBtn('➡', 'justifyRight', null, 'Align right')}
          <span style={{width: '1px', height: '20px', background: 'var(--ims-border)', margin: '0 4px'}} />
          <button type="button" onMouseDown={(e) => { e.preventDefault(); insertImagePrompt(); }} title="Insert image" style={{height: '30px', padding: '0 8px', background: 'var(--ims-bg-card-2)', border: '1px solid var(--ims-border)', color: 'var(--ims-text)', cursor: 'pointer', fontFamily: 'inherit', fontSize: '11px'}}>+ Gambar</button>
          {toolbarBtn('↺', 'undo', null, 'Undo')}
          {toolbarBtn('↻', 'redo', null, 'Redo')}
        </div>

        {/* POIN 2: Image toolbar — muncul saat gambar (stempel/TTD) dipilih */}
        {selectedImg && (
          <div style={{padding: '8px 18px', borderBottom: '1px solid var(--ims-border)', display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center', background: 'rgba(91,141,239,0.08)'}}>
            <span style={{fontSize: '11px', color: '#5b8def', fontWeight: 700}}>{lang === 'id' ? 'Gambar dipilih:' : 'Image selected:'}</span>
            <button type="button" onMouseDown={(e) => { e.preventDefault(); resizeSelectedImg(-10); }} className="btn-ghost" style={{fontSize: '11px', padding: '4px 10px'}} title="Perkecil 10%">− Kecil</button>
            <button type="button" onMouseDown={(e) => { e.preventDefault(); resizeSelectedImg(10); }} className="btn-ghost" style={{fontSize: '11px', padding: '4px 10px'}} title="Perbesar 10%">+ Besar</button>
            <span style={{width: '1px', height: '18px', background: 'var(--ims-border)', margin: '0 4px'}} />
            <button type="button" onMouseDown={(e) => { e.preventDefault(); setImgWidthPx(80); }} className="btn-ghost" style={{fontSize: '10px', padding: '4px 8px'}} title="TTD kecil">80px</button>
            <button type="button" onMouseDown={(e) => { e.preventDefault(); setImgWidthPx(120); }} className="btn-ghost" style={{fontSize: '10px', padding: '4px 8px'}} title="TTD sedang">120px</button>
            <button type="button" onMouseDown={(e) => { e.preventDefault(); setImgWidthPx(180); }} className="btn-ghost" style={{fontSize: '10px', padding: '4px 8px'}} title="Stempel besar">180px</button>
            <span style={{width: '1px', height: '18px', background: 'var(--ims-border)', margin: '0 4px'}} />
            <button type="button" onMouseDown={(e) => { e.preventDefault(); alignSelectedImg('left'); }} className="btn-ghost" style={{fontSize: '11px', padding: '4px 10px'}} title="Rata kiri">⬅ Kiri</button>
            <button type="button" onMouseDown={(e) => { e.preventDefault(); alignSelectedImg('center'); }} className="btn-ghost" style={{fontSize: '11px', padding: '4px 10px'}} title="Rata tengah">⬌ Tengah</button>
            <button type="button" onMouseDown={(e) => { e.preventDefault(); alignSelectedImg('right'); }} className="btn-ghost" style={{fontSize: '11px', padding: '4px 10px'}} title="Rata kanan">➡ Kanan</button>
            <span style={{fontSize: '10px', color: 'var(--ims-text-2)', fontStyle: 'italic', marginLeft: '4px'}}>{lang === 'id' ? '(klik di luar gambar untuk selesai)' : '(click outside to deselect)'}</span>
          </div>
        )}

        {/* Editor area — .a4-page di dalam initialHtml sudah jadi kertas A4 dengan kop background */}
        <style>{`.doc-editor-surface img{cursor:pointer;max-width:100%}.doc-editor-surface img:hover{outline:1px solid #5b8def88}`}</style>
        <div style={{flex: 1, overflow: 'auto', padding: '20px', background: '#525659', display: 'flex', justifyContent: 'center'}}>
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleEditorInput}
            onPaste={templateMode ? handleEditorPaste : undefined}
            onFocus={templateMode ? ensureEditorCaret : undefined}
            onClick={templateMode ? ensureEditorCaret : undefined}
            className="doc-editor-surface"
            style={{color: '#111', fontFamily: 'Arial, sans-serif', fontSize: '12px', lineHeight: 1.5, outline: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.4)', minHeight: templateMode ? '420px' : undefined}}
          />
        </div>

        {/* Footer actions */}
        <div style={{padding: '12px 18px', borderTop: '1px solid var(--ims-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap'}}>
          <div style={{fontSize: '11px', color: 'var(--ims-text-2)'}}>
            {dirty ? (lang === 'id' ? '● Ada perubahan belum disimpan' : '● Unsaved changes') : (lang === 'id' ? 'Siap disimpan' : 'Ready')}
          </div>
          <div style={{display: 'flex', gap: '8px'}}>
            {templateMode ? (
              <button onClick={() => handleSave('final')} className="btn-primary" style={{fontSize: '12px'}}><Check size={14} />{saveLabel || (lang === 'id' ? 'Simpan Template' : 'Save Template')}</button>
            ) : (
              <>
                <button onClick={() => handleSave('draft')} className="btn-ghost" style={{fontSize: '12px'}}><FileText size={13} />{lang === 'id' ? 'Simpan Draft' : 'Save Draft'}</button>
                <button onClick={() => handleSave('final')} className="btn-primary" style={{fontSize: '12px'}}><Check size={14} />{saveLabel || (lang === 'id' ? 'Kirim Dokumen' : 'Send Document')}</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export { DocumentEditorModal };
