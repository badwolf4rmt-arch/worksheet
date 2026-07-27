import type { WorksheetBlock, WorksheetDraft } from '@/data/worksheet'
import { BLOCK_TYPES } from '@/data/worksheet'
import { Button, Icon } from '@/components/ui'
import './Worksheet.css'
import './Loader.css'

type Mode = 'preview' | 'edit' | 'answers' | 'edit-widget' | 'add-block'

interface WorksheetScreenProps {
  draft: WorksheetDraft
  mode: Mode
  selectedBlockId?: string | null
  onSelectBlock?: (id: string | null) => void
  onChangeBlock?: (block: WorksheetBlock) => void
  onChangeDraft?: (draft: WorksheetDraft) => void
  onAddBlock?: (type: WorksheetBlock['type']) => void
  onRemoveBlock?: (id: string) => void
  onBack: () => void
  onEdit?: () => void
  onPreview?: () => void
  onConvert?: () => void
  onDownload?: () => void
  onMenu?: () => void
  onSettings?: () => void
  onShowAnswers?: () => void
  onAddBlockOpen?: () => void
  onCloseAddBlock?: () => void
}

export function WorksheetScreen({
  draft,
  mode,
  selectedBlockId,
  onSelectBlock,
  onChangeBlock,
  onChangeDraft,
  onAddBlock,
  onRemoveBlock,
  onBack,
  onEdit,
  onPreview,
  onConvert,
  onDownload,
  onMenu,
  onShowAnswers,
  onAddBlockOpen,
  onCloseAddBlock,
}: WorksheetScreenProps) {
  const selected = draft.blocks.find((b) => b.id === selectedBlockId) ?? null
  const isEdit = mode === 'edit' || mode === 'edit-widget' || mode === 'add-block'
  const showAnswers = mode === 'answers'

  return (
    <div className="ws-page">
      <header className="ws-navbar">
        <nav className="breadcrumbs" aria-label="Навигация">
          <button type="button" onClick={onBack}>
            Главная
          </button>
          <span>/</span>
          <button type="button" onClick={onBack}>
            Рабочие листы
          </button>
          <span>/</span>
          <span className="current">{draft.title || 'Без названия'}</span>
        </nav>

        <div className="ws-actions">
          <button type="button" className="icon-btn" onClick={onMenu} aria-label="Ещё">
            <Icon name="more" />
          </button>

          {isEdit ? (
            <>
              <Button variant="secondary" size="sm" onClick={onShowAnswers}>
                <Icon name="eye" size={16} /> Ответы
              </Button>
              <Button variant="secondary" size="sm" onClick={onConvert}>
                Преобразовать
              </Button>
              <Button variant="brand" size="sm" onClick={onPreview}>
                Предпросмотр
              </Button>
            </>
          ) : (
            <>
              <Button variant="secondary" size="sm" onClick={onConvert}>
                Преобразовать
              </Button>
              <Button variant="secondary" size="sm" onClick={onEdit}>
                <Icon name="edit" size={16} /> Редактировать
              </Button>
              <Button variant="brand" size="sm" onClick={onDownload}>
                Распечатать
              </Button>
            </>
          )}
        </div>
      </header>

      <div className={`ws-body-layout ${mode === 'edit-widget' || mode === 'add-block' ? 'with-side' : ''}`}>
        <aside className="page-rail">
          <button type="button" className="page-thumb active">
            1
          </button>
          {isEdit ? (
            <button type="button" className="page-add" onClick={onAddBlockOpen} aria-label="Добавить">
              <Icon name="plus" size={16} />
            </button>
          ) : (
            <button type="button" className="page-add" aria-label="Добавить страницу">
              <Icon name="plus" size={16} />
            </button>
          )}
        </aside>

        <main className="ws-canvas">
          <div className={`ws-sheet ${isEdit ? 'editing' : ''}`}>
            <div className="student-line">
              <span>Ученик:</span>
              <i />
            </div>

            {isEdit ? (
              <input
                className="sheet-title-input"
                value={draft.title}
                onChange={(e) => onChangeDraft?.({ ...draft, title: e.target.value })}
              />
            ) : (
              <h1 className="sheet-title">{draft.title}</h1>
            )}

            {isEdit ? (
              <textarea
                className="sheet-intro-input"
                value={draft.intro}
                rows={2}
                onChange={(e) => onChangeDraft?.({ ...draft, intro: e.target.value })}
              />
            ) : draft.intro ? (
              <p className="sheet-intro">{draft.intro}</p>
            ) : null}

            <div className="sheet-divider" />

            {draft.blocks.map((block, index) => (
              <BlockCard
                key={block.id}
                block={block}
                index={index}
                editable={isEdit}
                selected={selectedBlockId === block.id}
                showAnswer={showAnswers || Boolean(block.showAnswer)}
                onSelect={() => onSelectBlock?.(block.id)}
                onRemove={() => onRemoveBlock?.(block.id)}
              />
            ))}

            {isEdit ? (
              <button type="button" className="add-inline" onClick={onAddBlockOpen}>
                <Icon name="plus" size={16} /> Добавить блок
              </button>
            ) : null}
          </div>
        </main>

        {mode === 'edit-widget' && selected ? (
          <aside className="ws-sidepanel">
            <div className="side-head">
              <h3>Редактирование блока</h3>
              <button type="button" className="icon-btn" onClick={() => onSelectBlock?.(null)} aria-label="Закрыть">
                <Icon name="close" size={18} />
              </button>
            </div>
            <label className="side-field">
              <span>Тип</span>
              <strong>{BLOCK_TYPES.find((b) => b.type === selected.type)?.label ?? selected.type}</strong>
            </label>
            <label className="side-field">
              <span>Текст задания</span>
              <textarea
                rows={5}
                value={selected.body ?? ''}
                onChange={(e) => onChangeBlock?.({ ...selected, body: e.target.value })}
              />
            </label>
            <label className="side-field">
              <span>Сложность</span>
              <div className="diff-picker">
                {([1, 2, 3] as const).map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={(selected.difficulty ?? 1) >= n ? 'on' : ''}
                    onClick={() => onChangeBlock?.({ ...selected, difficulty: n })}
                  >
                    ★
                  </button>
                ))}
              </div>
            </label>
            {selected.type === 'answer' ? (
              <>
                <label className="side-field">
                  <span>Варианты (каждый с новой строки)</span>
                  <textarea
                    rows={4}
                    value={(selected.options ?? []).join('\n')}
                    onChange={(e) =>
                      onChangeBlock?.({
                        ...selected,
                        options: e.target.value.split('\n').filter(Boolean),
                      })
                    }
                  />
                </label>
                <label className="side-field">
                  <span>Правильный ответ</span>
                  <input
                    value={selected.answer ?? ''}
                    onChange={(e) => onChangeBlock?.({ ...selected, answer: e.target.value })}
                  />
                </label>
              </>
            ) : (
              <label className="side-field">
                <span>Ответ</span>
                <input
                  value={selected.answer ?? ''}
                  onChange={(e) => onChangeBlock?.({ ...selected, answer: e.target.value })}
                />
              </label>
            )}
            <Button variant="danger-soft" onClick={() => onRemoveBlock?.(selected.id)}>
              Удалить блок
            </Button>
          </aside>
        ) : null}

        {mode === 'add-block' ? (
          <aside className="ws-sidepanel">
            <div className="side-head">
              <h3>Добавить блок</h3>
              <button type="button" className="icon-btn" onClick={onCloseAddBlock} aria-label="Закрыть">
                <Icon name="close" size={18} />
              </button>
            </div>
            <div className="add-grid">
              {BLOCK_TYPES.map((b) => (
                <button key={b.type} type="button" className="add-type" onClick={() => onAddBlock?.(b.type)}>
                  <strong>{b.label}</strong>
                  <span>{b.hint}</span>
                </button>
              ))}
            </div>
          </aside>
        ) : null}
      </div>
    </div>
  )
}

function Stars({ value }: { value: number }) {
  return (
    <span className="stars" aria-label={`Сложность ${value} из 3`}>
      {[1, 2, 3].map((n) => (
        <span key={n} className={n <= value ? 'filled' : ''}>
          ★
        </span>
      ))}
    </span>
  )
}

function BlockCard({
  block,
  index,
  editable,
  selected,
  showAnswer,
  onSelect,
  onRemove,
}: {
  block: WorksheetBlock
  index: number
  editable: boolean
  selected: boolean
  showAnswer: boolean
  onSelect: () => void
  onRemove: () => void
}) {
  return (
    <article
      className={`ws-task ${selected ? 'selected' : ''} ${editable ? 'editable' : ''}`}
      onClick={editable ? onSelect : undefined}
    >
      <div className="ws-task-top">
        <p className="ws-task-text">
          <strong>{index + 1}.</strong> {block.body}
        </p>
        {editable ? (
          <button
            type="button"
            className="icon-btn tiny"
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            aria-label="Удалить"
          >
            <Icon name="trash" size={16} />
          </button>
        ) : null}
      </div>

      <div className="ws-task-meta">
        <span>Сложность</span>
        <Stars value={block.difficulty ?? 1} />
      </div>

      {block.type === 'answer' && block.options ? (
        <div className="options">
          {block.options.map((opt) => (
            <label key={opt} className={`option ${showAnswer && opt === block.answer ? 'correct' : ''}`}>
              <span className="checkbox" />
              {opt}
            </label>
          ))}
        </div>
      ) : null}

      {block.type === 'lines' ? <div className="lines">{Array.from({ length: 4 }).map((_, i) => <i key={i} />)}</div> : null}
      {block.type === 'grid' ? <div className="grid-field" /> : null}
      {block.type === 'image' || block.type === 'text-image' ? (
        <div className="image-placeholder">Изображение</div>
      ) : null}

      {showAnswer && block.answer ? <div className="answer-pill">Ответ: {block.answer}</div> : null}
    </article>
  )
}
