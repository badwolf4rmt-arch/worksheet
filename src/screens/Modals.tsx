import { Button, Field, Icon, Input, ModalShell, Select, Textarea } from '@/components/ui'
import { GRADES, SUBJECTS } from '@/data/worksheet'
import type { Modal, WorksheetDraft } from '@/data/worksheet'
import './Modals.css'

interface ModalsProps {
  modal: Modal
  draft: WorksheetDraft
  onClose: () => void
  onConfirmConvert: () => void
  onConfirmDelete: () => void
  onConfirmDuplicate: () => void
  onConfirmRegenerate: () => void
  onOpen: (modal: Modal) => void
}

export function Modals({
  modal,
  draft,
  onClose,
  onConfirmConvert,
  onConfirmDelete,
  onConfirmDuplicate,
  onConfirmRegenerate,
  onOpen,
}: ModalsProps) {
  return (
    <>
      <ModalShell open={modal === 'convert'} onClose={onClose} width={560}>
        <div className="modal-pad">
          <div className="modal-title-row">
            <h2>Преобразовать в задание</h2>
            <button type="button" className="icon-btn" onClick={onClose} aria-label="Закрыть">
              <Icon name="close" />
            </button>
          </div>
          <p className="modal-desc">
            Рабочий лист «{draft.title}» станет заданием для выдачи ученикам. Вы сможете назначить
            класс и срок сдачи.
          </p>
          <Field label="Название задания" required>
            <Input defaultValue={draft.title} />
          </Field>
          <div className="modal-row">
            <Field label="Класс">
              <Select options={GRADES.map((g) => `${g} класс`)} defaultValue={`${draft.grade} класс`} />
            </Field>
            <Field label="Срок сдачи">
              <Input type="date" />
            </Field>
          </div>
          <div className="modal-actions">
            <Button variant="secondary" onClick={onClose}>
              Отмена
            </Button>
            <Button variant="brand" onClick={onConfirmConvert}>
              Преобразовать
            </Button>
          </div>
        </div>
      </ModalShell>

      <ModalShell open={modal === 'convert-success'} onClose={onClose} width={440}>
        <div className="modal-pad center">
          <div className="success-ico">
            <Icon name="check" size={28} />
          </div>
          <h2>Задание создано</h2>
          <p className="modal-desc">
            Рабочий лист преобразован в задание. Его можно найти в библиотеке заданий.
          </p>
          <div className="modal-actions center">
            <Button variant="secondary" onClick={onClose}>
              Остаться здесь
            </Button>
            <Button variant="brand" onClick={onClose}>
              Открыть задание
            </Button>
          </div>
        </div>
      </ModalShell>

      <ModalShell open={modal === 'settings'} onClose={onClose} width={520}>
        <div className="modal-pad">
          <div className="modal-title-row">
            <h2>Настройки рабочего листа</h2>
            <button type="button" className="icon-btn" onClick={onClose} aria-label="Закрыть">
              <Icon name="close" />
            </button>
          </div>
          <Field label="Название">
            <Input defaultValue={draft.title} />
          </Field>
          <div className="modal-row">
            <Field label="Предмет">
              <Select options={SUBJECTS} defaultValue={draft.subject} />
            </Field>
            <Field label="Параллель">
              <Select options={GRADES} defaultValue={draft.grade} />
            </Field>
          </div>
          <label className="check-row">
            <input type="checkbox" defaultChecked /> Показывать нумерацию заданий
          </label>
          <label className="check-row">
            <input type="checkbox" defaultChecked /> Включать место для ФИО ученика
          </label>
          <div className="modal-actions">
            <Button variant="secondary" onClick={onClose}>
              Отмена
            </Button>
            <Button variant="brand" onClick={onClose}>
              Сохранить
            </Button>
          </div>
        </div>
      </ModalShell>

      <ModalShell open={modal === 'download'} onClose={onClose} width={440}>
        <div className="modal-pad">
          <div className="modal-title-row">
            <h2>Скачать рабочий лист</h2>
            <button type="button" className="icon-btn" onClick={onClose} aria-label="Закрыть">
              <Icon name="close" />
            </button>
          </div>
          <div className="download-list">
            <button type="button" className="download-item" onClick={onClose}>
              <strong>PDF</strong>
              <span>Для печати и раздачи</span>
            </button>
            <button type="button" className="download-item" onClick={onClose}>
              <strong>DOCX</strong>
              <span>Редактируемый документ</span>
            </button>
            <button type="button" className="download-item" onClick={onClose}>
              <strong>PDF с ответами</strong>
              <span>Версия для преподавателя</span>
            </button>
          </div>
        </div>
      </ModalShell>

      <ModalShell open={modal === 'menu'} onClose={onClose} width={360} className="menu-modal">
        <div className="menu-list">
          <button type="button" onClick={() => onOpen('settings')}>
            <Icon name="gear" /> Настройки
          </button>
          <button type="button" onClick={() => onOpen('regenerate')}>
            <Icon name="refresh" /> Перегенерировать
          </button>
          <button type="button" onClick={() => onOpen('duplicate')}>
            <Icon name="copy" /> Дублировать
          </button>
          <button type="button" onClick={() => onOpen('download')}>
            <Icon name="download" /> Скачать
          </button>
          <button type="button" className="danger" onClick={() => onOpen('delete')}>
            <Icon name="trash" /> Удалить
          </button>
        </div>
      </ModalShell>

      <ModalShell open={modal === 'duplicate'} onClose={onClose} width={440}>
        <div className="modal-pad">
          <div className="modal-title-row">
            <h2>Дублировать рабочий лист?</h2>
            <button type="button" className="icon-btn" onClick={onClose} aria-label="Закрыть">
              <Icon name="close" />
            </button>
          </div>
          <p className="modal-desc">
            Будет создана копия «{draft.title}». Исходный лист останется без изменений.
          </p>
          <div className="modal-actions">
            <Button variant="secondary" onClick={onClose}>
              Отмена
            </Button>
            <Button variant="brand" onClick={onConfirmDuplicate}>
              Дублировать
            </Button>
          </div>
        </div>
      </ModalShell>

      <ModalShell open={modal === 'delete'} onClose={onClose} width={440}>
        <div className="modal-pad">
          <div className="modal-title-row">
            <h2>Удалить рабочий лист?</h2>
            <button type="button" className="icon-btn" onClick={onClose} aria-label="Закрыть">
              <Icon name="close" />
            </button>
          </div>
          <p className="modal-desc">
            «{draft.title}» будет удалён безвозвратно. Это действие нельзя отменить.
          </p>
          <div className="modal-actions">
            <Button variant="secondary" onClick={onClose}>
              Отмена
            </Button>
            <Button variant="danger" onClick={onConfirmDelete}>
              Удалить
            </Button>
          </div>
        </div>
      </ModalShell>

      <ModalShell open={modal === 'regenerate' || modal === 'regenerate-empty-topic'} onClose={onClose} width={560}>
        <div className="modal-pad">
          <div className="modal-title-row">
            <h2>Перегенерация рабочего листа</h2>
            <button type="button" className="icon-btn" onClick={onClose} aria-label="Закрыть">
              <Icon name="close" />
            </button>
          </div>
          <p className="modal-desc">
            Текущее содержимое будет заменено новой генерацией. Можно уточнить тему и пожелания.
          </p>
          <Field label="Тема" required>
            <Input
              defaultValue={modal === 'regenerate-empty-topic' ? '' : draft.topic}
              placeholder="Укажите тему"
            />
          </Field>
          <Field label="Пожелания">
            <Textarea
              defaultValue={draft.wishes}
              placeholder="Что изменить: сложность, типы заданий, акценты..."
              counter="0/500"
            />
          </Field>
          {modal === 'regenerate-empty-topic' ? (
            <p className="error-note">Укажите тему, чтобы запустить перегенерацию</p>
          ) : null}
          <div className="modal-actions">
            <Button variant="secondary" onClick={onClose}>
              Отмена
            </Button>
            <Button
              variant="brand"
              onClick={() => {
                if (modal === 'regenerate-empty-topic') return
                onConfirmRegenerate()
              }}
              disabled={modal === 'regenerate-empty-topic'}
            >
              Перегенерировать
            </Button>
          </div>
        </div>
      </ModalShell>
    </>
  )
}
