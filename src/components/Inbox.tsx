import { useRef, useState, type FormEvent } from 'react'
import type { DraftAttachmentInput } from '../hooks/useFamilySpace'
import type { InboxEntry } from '../types'

interface InboxProps {
  pending: InboxEntry[]
  onQueue: (text: string, attachments: DraftAttachmentInput[]) => void
  onQueueAndProcess: (text: string, attachments: DraftAttachmentInput[]) => void
  onProcessAll: () => void
  onProcessOne: (id: string) => void
  onRemove: (id: string) => void
}

export function Inbox({
  pending,
  onQueue,
  onQueueAndProcess,
  onProcessAll,
  onProcessOne,
  onRemove,
}: InboxProps) {
  const [text, setText] = useState('')
  const [attachments, setAttachments] = useState<DraftAttachmentInput[]>([])
  const [link, setLink] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  function collectAttachments(): DraftAttachmentInput[] {
    const nextAttachments = [...attachments]
    const trimmedLink = link.trim()
    if (trimmedLink) {
      nextAttachments.push({
        kind: trimmedLink.toLowerCase().includes('.pdf') ? 'pdf' : 'link',
        name: trimmedLink,
        href: trimmedLink,
      })
    }
    return nextAttachments
  }

  function clearComposer() {
    setText('')
    setLink('')
    setAttachments([])
    if (fileRef.current) fileRef.current.value = ''
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const nextAttachments = collectAttachments()
    if (!text.trim() && nextAttachments.length === 0) return
    onQueue(text, nextAttachments)
    clearComposer()
  }

  function handleOrganize() {
    const nextAttachments = collectAttachments()
    onQueueAndProcess(text, nextAttachments)
    clearComposer()
  }

  function handleFiles(fileList: FileList | null) {
    if (!fileList) return
    const next: DraftAttachmentInput[] = []
    for (const file of Array.from(fileList)) {
      const kind = file.type.startsWith('image/')
        ? 'image'
        : file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
          ? 'pdf'
          : 'file'
      next.push({
        kind,
        name: file.name,
        mimeType: file.type || undefined,
      })
    }
    setAttachments((current) => [...current, ...next])
  }

  return (
    <section className="inbox-panel" aria-labelledby="inbox-heading">
      <div className="panel-heading">
        <h2 id="inbox-heading">インボックス</h2>
        <p>メモを雑に入れて、「整理して反映」で振り分けます。</p>
      </div>

      <form className="inbox-form" onSubmit={handleSubmit}>
        <label className="field">
          <span>メモ</span>
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={5}
            placeholder={
              '例:\n幼稚園の遠足 10月3日 お弁当\n祖母の誕生日は3月3日\nおじいちゃんからお年玉1万円\nNetflix解約 来月末'
            }
          />
        </label>

        <div className="inbox-attach-row">
          <label className="field grow">
            <span>PDF / プリントのリンク</span>
            <input
              value={link}
              onChange={(event) => setLink(event.target.value)}
              placeholder="https://...pdf"
              inputMode="url"
            />
          </label>

          <div className="field">
            <span>写真・PDF</span>
            <button
              type="button"
              className="ghost-button"
              onClick={() => fileRef.current?.click()}
            >
              カメラ / ファイル
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,application/pdf"
              capture="environment"
              multiple
              hidden
              onChange={(event) => handleFiles(event.target.files)}
            />
          </div>
        </div>

        {attachments.length > 0 && (
          <ul className="attachment-list">
            {attachments.map((file) => (
              <li key={`${file.name}-${file.kind}`}>
                {labelForKind(file.kind)}: {file.name}
              </li>
            ))}
          </ul>
        )}

        <p className="inbox-hint">
          写真やPDFはファイル名を控えて関連付けます。プリントの文字は、メモ欄に要点を書くか、読み取ったテキストを貼ると日付・金額まで整理できます。
        </p>

        <div className="inbox-actions">
          <button type="submit" className="ghost-button">
            インボックスに入れる
          </button>
          <button type="button" className="primary-button" onClick={handleOrganize}>
            整理して反映
          </button>
        </div>
      </form>

      {pending.length > 0 && (
        <div className="pending-box">
          <div className="panel-heading compact">
            <h3>未整理 {pending.length} 件</h3>
            <button type="button" className="ghost-button" onClick={onProcessAll}>
              まとめて反映
            </button>
          </div>
          <ul className="pending-list">
            {pending.map((entry) => (
              <li key={entry.id}>
                <pre>{entry.text || '（添付のみ）'}</pre>
                {entry.attachments.length > 0 && (
                  <p className="pending-attachments">
                    添付: {entry.attachments.map((item) => item.name).join(' / ')}
                  </p>
                )}
                <div className="pending-actions">
                  <button
                    type="button"
                    className="primary-button"
                    onClick={() => onProcessOne(entry.id)}
                  >
                    反映
                  </button>
                  <button
                    type="button"
                    className="ghost-button"
                    onClick={() => onRemove(entry.id)}
                  >
                    削除
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}

function labelForKind(kind: DraftAttachmentInput['kind']): string {
  if (kind === 'image') return '写真'
  if (kind === 'pdf') return 'PDF'
  if (kind === 'link') return 'リンク'
  return 'ファイル'
}
