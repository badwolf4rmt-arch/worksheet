import { useMemo } from 'react'
import type { TaskType, WorksheetBlock, WorksheetDraft } from '@/data/worksheet'
import { TASK_TYPE_META, labelForType } from '@/data/worksheet'
import { Button, Icon, Input, Textarea } from '@/components/ui'
import { MathText } from '@/components/MathText'
import starFilled from '@/assets/worksheet/star-filled.svg'
import starEmpty from '@/assets/worksheet/star-empty.svg'
import plusIcon from '@/assets/worksheet/plus.svg'
import './Worksheet.css'
import './Loader.css'

type Mode = 'preview' | 'edit' | 'answers' | 'edit-widget' | 'add-block'

interface WorksheetScreenProps {
  draft: WorksheetDraft
  mode: Mode
  selectedBlockId?: string | null
  currentPage: number
  onPageChange: (page: number) => void
  onSelectBlock?: (id: string | null) => void
  onChangeBlock?: (block: WorksheetBlock) => void
  onChangeDraft?: (draft: WorksheetDraft) => void
  onAddBlock?: (type: TaskType) => void
  onRemoveBlock?: (id: string) => void
  onMoveBlock?: (id: string, dir: -1 | 1) => void
  onAddPage?: () => void
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
  onGenerateTask?: () => void
}

export function WorksheetScreen({
  draft,
  mode,
  selectedBlockId,
  currentPage,
  onPageChange,
  onSelectBlock,
  onChangeBlock,
  onChangeDraft,
  onAddBlock,
  onRemoveBlock,
  onMoveBlock,
  onAddPage,
  onBack,
  onEdit,
  onPreview,
  onConvert,
  onDownload,
  onMenu,
  onShowAnswers,
  onAddBlockOpen,
  onCloseAddBlock,
  onGenerateTask,
}: WorksheetScreenProps) {
  const selected = draft.blocks.find((b) => b.id === selectedBlockId) ?? null
  const isEdit = mode === 'edit' || mode === 'edit-widget' || mode === 'add-block'
  const showAnswers = mode === 'answers' || draft.showAnswers

  const pageBlocks = useMemo(
    () => draft.blocks.filter((b) => b.page === currentPage),
    [draft.blocks, currentPage],
  )

  const pageCount = Math.max(draft.pages, 1)

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
            <Icon name="more" size={20} />
          </button>

          {isEdit ? (
            <>
              <Button variant="ghost" size="sm" onClick={onGenerateTask}>
                <Icon name="refresh" size={20} /> Сгенерировать задание
              </Button>
              <Button variant="ghost" size="sm" onClick={onShowAnswers}>
                <Icon name="eye" size={20} /> {showAnswers ? 'Скрыть ответы' : 'Ответы'}
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
                <Icon name="edit" size={20} /> Редактировать
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
          {Array.from({ length: pageCount }, (_, i) => (
            <button
              key={i}
              type="button"
              className={`page-thumb ${currentPage === i ? 'active' : ''}`}
              onClick={() => onPageChange(i)}
            >
              {i + 1}
            </button>
          ))}
          <button type="button" className="page-add" onClick={onAddPage} aria-label="Добавить страницу">
            <img src={plusIcon} alt="" width={20} height={20} />
          </button>
        </aside>

        <main className="ws-canvas">
          <div className={`ws-sheet ${isEdit ? 'editing' : ''} ${draft.print.orientation}`}>
            <div className="sheet-header">
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
            </div>

            <div className="sheet-divider" />

            <div className="sheet-content">
              {isEdit ? (
                <div className="sheet-intro-widget">
                  <textarea
                    className="sheet-intro-input"
                    value={draft.intro}
                    rows={2}
                    placeholder="Вводная часть (необязательно)"
                    onChange={(e) => onChangeDraft?.({ ...draft, intro: e.target.value })}
                  />
                </div>
              ) : draft.intro ? (
                <div className="sheet-intro-widget">
                  <MathText as="p" className="sheet-intro" text={draft.intro} />
                </div>
              ) : null}

              {pageBlocks.map((block, index) => (
                <BlockCard
                  key={block.id}
                  block={block}
                  index={index}
                  editable={isEdit}
                  selected={selectedBlockId === block.id}
                  showAnswer={showAnswers}
                  showDifficulty={draft.showDifficulty}
                  onSelect={() => onSelectBlock?.(block.id)}
                  onRemove={() => onRemoveBlock?.(block.id)}
                  onMoveUp={() => onMoveBlock?.(block.id, -1)}
                  onMoveDown={() => onMoveBlock?.(block.id, 1)}
                />
              ))}

              {isEdit ? (
                <div className="edit-actions-row">
                  <button type="button" className="add-inline" onClick={onAddBlockOpen}>
                    <Icon name="plus" size={20} /> Добавить блок
                  </button>
                  <button type="button" className="add-inline ghost" onClick={onGenerateTask}>
                    <Icon name="refresh" size={20} /> Сгенерировать задание
                  </button>
                </div>
              ) : null}
            </div>
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
              <strong>{labelForType(selected.type)}</strong>
            </label>
            <label className="side-field">
              <span>Заголовок</span>
              <Input
                value={selected.title}
                onChange={(e) => onChangeBlock?.({ ...selected, title: e.target.value })}
              />
            </label>
            {selected.instruction !== undefined ? (
              <label className="side-field">
                <span>Инструкция</span>
                <Input
                  value={selected.instruction ?? ''}
                  onChange={(e) => onChangeBlock?.({ ...selected, instruction: e.target.value })}
                />
              </label>
            ) : null}
            <label className="side-field">
              <span>Вопрос / текст</span>
              <Textarea
                rows={4}
                value={selected.question ?? selected.body ?? selected.gapsText ?? ''}
                onChange={(e) => {
                  if (selected.type === 'fill_gaps') {
                    onChangeBlock?.({ ...selected, gapsText: e.target.value, question: e.target.value })
                  } else if (selected.type === 'text') {
                    onChangeBlock?.({ ...selected, body: e.target.value })
                  } else {
                    onChangeBlock?.({ ...selected, question: e.target.value })
                  }
                }}
              />
            </label>
            {(selected.type === 'single_choice' || selected.type === 'multiple_choice') && (
              <label className="side-field">
                <span>Варианты (каждый с новой строки)</span>
                <Textarea
                  rows={4}
                  value={(selected.options ?? []).map((o) => o.text).join('\n')}
                  onChange={(e) => {
                    const texts = e.target.value.split('\n')
                    onChangeBlock?.({
                      ...selected,
                      options: texts.map((text, i) => ({
                        id: selected.options?.[i]?.id ?? `option_${i + 1}`,
                        text,
                      })),
                    })
                  }}
                />
              </label>
            )}
            {(selected.correctAnswers || selected.correctOptionId) && (
              <label className="side-field">
                <span>Правильный ответ</span>
                <Input
                  value={
                    selected.correctAnswers?.join(', ') ??
                    selected.options?.find((o) => o.id === selected.correctOptionId)?.text ??
                    ''
                  }
                  onChange={(e) =>
                    onChangeBlock?.({
                      ...selected,
                      correctAnswers: e.target.value.split(',').map((s) => s.trim()),
                    })
                  }
                />
              </label>
            )}
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
                    <img
                      src={(selected.difficulty ?? 1) >= n ? starFilled : starEmpty}
                      alt=""
                      width={16}
                      height={16}
                    />
                  </button>
                ))}
              </div>
            </label>
            <div className="side-actions">
              <Button variant="secondary" onClick={() => onMoveBlock?.(selected.id, -1)}>
                ↑ Выше
              </Button>
              <Button variant="secondary" onClick={() => onMoveBlock?.(selected.id, 1)}>
                ↓ Ниже
              </Button>
            </div>
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
            <p className="side-section-label">Готовые блоки заданий</p>
            <div className="add-grid">
              {TASK_TYPE_META.filter((b) => b.category === 'task').map((b) => (
                <button key={b.type} type="button" className="add-type" onClick={() => onAddBlock?.(b.type)}>
                  <strong>{b.label}</strong>
                  <span>{b.hint}</span>
                </button>
              ))}
            </div>
            <p className="side-section-label">Инструменты</p>
            <div className="add-grid">
              {TASK_TYPE_META.filter((b) => b.category === 'element').map((b) => (
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
        <img
          key={n}
          src={n <= value ? starFilled : starEmpty}
          alt=""
          width={16}
          height={16}
          className={n <= value ? 'filled' : ''}
        />
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
  showDifficulty,
  onSelect,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  block: WorksheetBlock
  index: number
  editable: boolean
  selected: boolean
  showAnswer: boolean
  showDifficulty: boolean
  onSelect: () => void
  onRemove: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}) {
  if (block.type === 'page_break') {
    return (
      <div
        className={`page-break-block ${selected ? 'selected' : ''} ${editable ? 'editable' : ''}`}
        onClick={editable ? onSelect : undefined}
      >
        — Разрыв страницы —
      </div>
    )
  }

  const number = index + 1
  const question = block.question ?? block.body ?? block.gapsText ?? ''
  const isPlainText = block.type === 'text'

  return (
    <article
      className={`ws-task ${selected ? 'selected' : ''} ${editable ? 'editable' : ''} ${isPlainText ? 'plain' : ''}`}
      onClick={editable ? onSelect : undefined}
    >
      <div className="ws-task-head">
        {!isPlainText ? <span className="ws-task-num">{number}.</span> : null}
        <div className="ws-task-main">
          <p className="ws-task-text">
            {block.instruction ? (
              <>
                <MathText className="instruction" text={block.instruction} />{' '}
              </>
            ) : null}
            <MathText text={question} />
          </p>
          {showDifficulty && !isPlainText ? (
            <div className="ws-task-meta">
              <span className="diff-label">Сложность:</span>
              <Stars value={block.difficulty ?? 1} />
            </div>
          ) : null}
        </div>
        {editable ? (
          <div className="block-tools" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="icon-btn tiny" onClick={onMoveUp} aria-label="Выше">
              ↑
            </button>
            <button type="button" className="icon-btn tiny" onClick={onMoveDown} aria-label="Ниже">
              ↓
            </button>
            <button type="button" className="icon-btn tiny" onClick={onRemove} aria-label="Удалить">
              <Icon name="trash" size={16} />
            </button>
          </div>
        ) : null}
      </div>

      {block.type === 'single_choice' || block.type === 'multiple_choice' ? (
        <div className="ws-task-slot options">
          {(block.options ?? []).map((opt) => {
            const correct =
              block.type === 'single_choice'
                ? opt.id === block.correctOptionId
                : (block.correctOptionIds ?? []).includes(opt.id)
            return (
              <label key={opt.id} className={`option ${showAnswer && correct ? 'correct' : ''}`}>
                <span className="checkbox" />
                <MathText text={opt.text} />
              </label>
            )
          })}
        </div>
      ) : null}

      {block.type === 'short_answer' || block.type === 'extended_answer' || block.type === 'answer_field' ? (
        <div className="ws-task-slot lines">
          {Array.from({
            length: block.answerLines ?? (block.type === 'extended_answer' ? 5 : 2),
          }).map((_, i) => (
            <i key={i} />
          ))}
        </div>
      ) : null}

      {block.type === 'fill_gaps' ? (
        <div className="ws-task-slot">
          <p className="gaps-preview">
            {(block.gapsText ?? '').split('___').map((part, i, arr) => (
              <span key={i}>
                <MathText text={part} />
                {i < arr.length - 1 ? <span className="gap-blank">______</span> : null}
              </span>
            ))}
          </p>
        </div>
      ) : null}

      {block.type === 'matching' ? (
        <div className="ws-task-slot match-grid">
          <div>
            {(block.leftItems ?? []).map((item) => (
              <div key={item.id} className="match-item">
                <MathText text={item.text} />
              </div>
            ))}
          </div>
          <div>
            {(block.rightItems ?? []).map((item) => (
              <div key={item.id} className="match-item">
                <MathText text={item.text} />
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {block.type === 'grouping' ? (
        <div className="ws-task-slot group-grid">
          {(block.groups ?? []).map((g) => (
            <div key={g.id} className="group-card">
              <strong>
                <MathText text={g.title} />
              </strong>
              <ul>
                {g.items.map((item) => (
                  <li key={item}>
                    <MathText text={item} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : null}

      {block.type === 'ordering' ? (
        <ol className="ws-task-slot order-list">
          {(block.orderItems ?? []).map((item) => (
            <li key={item}>
              <MathText text={item} />
            </li>
          ))}
        </ol>
      ) : null}

      {block.type === 'table' ? (
        <div className="ws-task-slot">
          <div className="grid-field" />
        </div>
      ) : null}

      {showAnswer && (block.correctAnswers?.length || block.correctOptionId) ? (
        <div className="ws-task-slot">
          <div className="answer-pill">
            Ответ:{' '}
            <MathText
              text={
                block.correctAnswers?.join(', ') ||
                block.options?.find((o) => o.id === block.correctOptionId)?.text ||
                (block.correctOptionIds ?? [])
                  .map((id) => block.options?.find((o) => o.id === id)?.text)
                  .filter(Boolean)
                  .join(', ') ||
                ''
              }
            />
          </div>
        </div>
      ) : null}
    </article>
  )
}
