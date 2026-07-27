import { useEffect, useRef, useState } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { PrototypeNav } from '@/components/PrototypeNav'
import { generateSingleTaskAI, generateWorksheetAI } from '@/data/ai'
import type { GenerateMode } from '@/data/ai'
import { hasApiKey } from '@/data/apiKey'
import {
  createEmptyBlock,
  createManualWorksheet,
  generateWorksheet,
} from '@/data/generator'
import { emptyDraft, filledCreateDraft, uid } from '@/data/worksheet'
import type { Modal, Screen, TaskType, WorksheetBlock, WorksheetDraft } from '@/data/worksheet'
import { Home } from '@/screens/Home'
import { Create } from '@/screens/Create'
import { Loader } from '@/screens/Loader'
import { WorksheetScreen } from '@/screens/Worksheet'
import { Modals } from '@/screens/Modals'

function demoDraft(): WorksheetDraft {
  return generateWorksheet({
    ...filledCreateDraft(),
    topic: 'Закрепление материала',
    title: 'Закрепление материала',
    wishes: 'Класс только начал тему',
  })
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [createMode, setCreateMode] = useState<'generate' | 'manual'>('generate')
  const [draft, setDraft] = useState<WorksheetDraft>(() => demoDraft())
  const [modal, setModal] = useState<Modal>(null)
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [pendingGenerate, setPendingGenerate] = useState(false)
  const [generateMode, setGenerateMode] = useState<GenerateMode>('create')
  const [generateTaskType, setGenerateTaskType] = useState<TaskType>('short_answer')
  const [generateTaskHint, setGenerateTaskHint] = useState('')
  const [generateTaskBusy, setGenerateTaskBusy] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const toastTimer = useRef<number | null>(null)
  const draftRef = useRef(draft)
  const generateModeRef = useRef<GenerateMode>('create')
  draftRef.current = draft
  generateModeRef.current = generateMode

  const showToast = (message: string) => {
    setToastMessage(message)
    setModal('toast')
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => {
      setModal(null)
      setToastMessage('')
    }, 2800)
  }

  useEffect(() => {
    if (screen !== 'loader') return
    let cancelled = false
    const started = Date.now()
    const mode = generateModeRef.current

    ;(async () => {
      try {
        const next = await generateWorksheetAI(draftRef.current, mode)
        const wait = Math.max(0, 900 - (Date.now() - started))
        await new Promise((r) => window.setTimeout(r, wait))
        if (cancelled) return
        setDraft(next)
        setPendingGenerate(false)
        setCurrentPage(0)
        setScreen(mode === 'regenerate' ? 'edit' : 'preview')
        if (!hasApiKey()) showToast('Демо-генерация (добавьте API-ключ)')
        else if (mode === 'regenerate') showToast('Рабочий лист перегенерирован')
      } catch (err) {
        if (cancelled) return
        setPendingGenerate(false)
        setScreen(mode === 'regenerate' ? 'edit' : 'create')
        showToast(err instanceof Error ? err.message : 'Ошибка генерации')
      }
    })()

    return () => {
      cancelled = true
    }
  }, [screen])

  useEffect(() => {
    if (screen === 'create-manual') setCreateMode('manual')
    if (screen === 'create' || screen === 'create-advanced' || screen === 'create-filled') {
      setCreateMode('generate')
    }
    if (screen === 'edit-widget' && !selectedBlockId && draft.blocks[0]) {
      setSelectedBlockId(draft.blocks[0].id)
    }
  }, [screen, selectedBlockId, draft.blocks])

  const openCreate = () => {
    setDraft(emptyDraft())
    setCreateMode('generate')
    setScreen('create')
  }

  const submitCreate = () => {
    if (createMode === 'manual') {
      setDraft((d) => createManualWorksheet(d))
      setCurrentPage(0)
      setScreen('edit')
      return
    }
    setPendingGenerate(true)
    setGenerateMode('create')
    setDraft((d) => ({ ...d, title: d.topic || d.title }))
    setScreen('loader')
  }

  const updateBlock = (block: WorksheetBlock) => {
    setDraft((d) => ({
      ...d,
      blocks: d.blocks.map((b) => (b.id === block.id ? block : b)),
    }))
  }

  const addBlock = (type: TaskType) => {
    if (type === 'page_break') {
      const nextPage = draft.pages
      const block = createEmptyBlock('page_break', currentPage)
      setDraft((d) => ({
        ...d,
        pages: d.pages + 1,
        blocks: [...d.blocks, block],
      }))
      setCurrentPage(nextPage)
      setSelectedBlockId(null)
      setScreen('edit')
      return
    }
    const block = createEmptyBlock(type, currentPage)
    setDraft((d) => ({ ...d, blocks: [...d.blocks, block] }))
    setSelectedBlockId(block.id)
    setScreen('edit-widget')
  }

  const removeBlock = (id: string) => {
    setDraft((d) => ({ ...d, blocks: d.blocks.filter((b) => b.id !== id) }))
    setSelectedBlockId(null)
    setScreen('edit')
  }

  const moveBlock = (id: string, dir: -1 | 1) => {
    setDraft((d) => {
      const pageBlocks = d.blocks.filter((b) => b.page === currentPage)
      const others = d.blocks.filter((b) => b.page !== currentPage)
      const idx = pageBlocks.findIndex((b) => b.id === id)
      const swap = idx + dir
      if (idx < 0 || swap < 0 || swap >= pageBlocks.length) return d
      const next = [...pageBlocks]
      ;[next[idx], next[swap]] = [next[swap], next[idx]]
      return { ...d, blocks: [...others, ...next] }
    })
  }

  const addPage = () => {
    setDraft((d) => ({ ...d, pages: d.pages + 1 }))
    setCurrentPage(draft.pages)
  }

  const confirmGenerateTask = async () => {
    if (generateTaskBusy) return
    setGenerateTaskBusy(true)
    try {
      const block = await generateSingleTaskAI(draft, generateTaskType, generateTaskHint)
      block.page = currentPage
      setDraft((d) => ({ ...d, blocks: [...d.blocks, block], taskCount: d.taskCount + 1 }))
      setSelectedBlockId(block.id)
      setModal(null)
      setGenerateTaskHint('')
      setScreen('edit-widget')
      showToast(hasApiKey() ? 'Задание добавлено' : 'Задание добавлено (демо)')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Ошибка генерации задания')
    } finally {
      setGenerateTaskBusy(false)
    }
  }

  const handleSave = () => {
    const saved = { ...draft, savedAt: new Date().toISOString() }
    setDraft(saved)
    localStorage.setItem(`worksheet:${saved.id}`, JSON.stringify(saved))
    setModal(null)
    showToast('Рабочий лист сохранён')
  }

  const handlePrint = () => {
    setModal(null)
    const prevAnswers = draft.showAnswers
    if (draft.print.answersSeparate) {
      setDraft((d) => ({ ...d, showAnswers: false }))
      window.setTimeout(() => {
        window.print()
        setDraft((d) => ({ ...d, showAnswers: true }))
        window.setTimeout(() => {
          window.print()
          setDraft((d) => ({ ...d, showAnswers: prevAnswers }))
        }, 400)
      }, 100)
    } else {
      window.setTimeout(() => window.print(), 50)
    }
  }

  const goScreen = (next: Screen) => {
    if (next === 'create-manual') {
      setCreateMode('manual')
      setDraft(emptyDraft())
    }
    if (next === 'create') {
      setCreateMode('generate')
      setDraft(emptyDraft())
    }
    if (next === 'create-advanced') {
      setCreateMode('generate')
      setDraft(emptyDraft())
    }
    if (next === 'create-filled') {
      setCreateMode('generate')
      setDraft(filledCreateDraft())
    }
    if (
      (next === 'preview' ||
        next === 'edit' ||
        next === 'show-answers' ||
        next === 'edit-widget' ||
        next === 'add-block') &&
      draft.blocks.length === 0 &&
      !pendingGenerate
    ) {
      setDraft(demoDraft())
    }
    setScreen(next)
  }

  const worksheetMode =
    screen === 'preview'
      ? 'preview'
      : screen === 'show-answers'
        ? 'answers'
        : screen === 'edit-widget'
          ? 'edit-widget'
          : screen === 'add-block'
            ? 'add-block'
            : 'edit'

  return (
    <>
      {screen === 'home' ? (
        <div className="app-shell">
          <Sidebar />
          <div className="main-pane">
            <div className="main-card">
              <Home onCreateWorksheet={openCreate} />
            </div>
          </div>
        </div>
      ) : null}

      {screen === 'create' ||
      screen === 'create-advanced' ||
      screen === 'create-filled' ||
      screen === 'create-manual' ? (
        <Create
          key={screen}
          mode={createMode}
          draft={draft}
          advancedOpen={screen === 'create-advanced' || screen === 'create-filled'}
          onChange={setDraft}
          onModeChange={(m) => {
            setCreateMode(m)
            setScreen(m === 'manual' ? 'create-manual' : 'create')
          }}
          onClose={() => setScreen('home')}
          onSubmit={submitCreate}
        />
      ) : null}

      {screen === 'loader' ? (
        <Loader
          title={draft.title || draft.topic || 'Рабочий лист'}
          message={
            generateMode === 'regenerate'
              ? 'Пересобираю задания…'
              : 'Думаю над темой'
          }
          onHome={() => setScreen('home')}
        />
      ) : null}

      {screen === 'preview' ||
      screen === 'edit' ||
      screen === 'edit-widget' ||
      screen === 'add-block' ||
      screen === 'show-answers' ? (
        <WorksheetScreen
          draft={draft}
          mode={worksheetMode}
          selectedBlockId={selectedBlockId}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onSelectBlock={(id) => {
            setSelectedBlockId(id)
            setScreen(id ? 'edit-widget' : 'edit')
          }}
          onChangeBlock={updateBlock}
          onChangeDraft={setDraft}
          onAddBlock={addBlock}
          onRemoveBlock={removeBlock}
          onMoveBlock={moveBlock}
          onAddPage={addPage}
          onBack={() => setScreen('home')}
          onEdit={() => setScreen('edit')}
          onPreview={() => setScreen('preview')}
          onConvert={() => setModal('convert')}
          onDownload={() => setModal('download')}
          onMenu={() => setModal('menu')}
          onSettings={() => setModal('settings')}
          onShowAnswers={() => {
            setDraft((d) => ({ ...d, showAnswers: !d.showAnswers }))
            setScreen((s) => (s === 'show-answers' ? 'preview' : 'show-answers'))
          }}
          onAddBlockOpen={() => setScreen('add-block')}
          onCloseAddBlock={() => setScreen('edit')}
          onGenerateTask={() => setModal('generate-task')}
        />
      ) : null}

      <Modals
        modal={modal}
        draft={draft}
        generateTaskType={generateTaskType}
        generateTaskHint={generateTaskHint}
        generateTaskBusy={generateTaskBusy}
        toastMessage={toastMessage}
        onClose={() => setModal(null)}
        onOpen={setModal}
        onChangeDraft={setDraft}
        onGenerateTaskType={setGenerateTaskType}
        onGenerateTaskHint={setGenerateTaskHint}
        onConfirmConvert={() => setModal('convert-success')}
        onConfirmDuplicate={() => {
          setDraft((d) => ({
            ...d,
            id: uid('ws'),
            title: `${d.title} (копия)`,
          }))
          setModal(null)
          showToast('Создана копия')
        }}
        onConfirmDelete={() => {
          setModal(null)
          setDraft(emptyDraft())
          setScreen('home')
          showToast('Рабочий лист удалён')
        }}
        onConfirmRegenerate={() => {
          if (!draft.topic.trim()) {
            setModal('regenerate-empty-topic')
            return
          }
          setModal(null)
          setPendingGenerate(true)
          setGenerateMode('regenerate')
          setScreen('loader')
        }}
        onConfirmGenerateTask={confirmGenerateTask}
        onPrint={handlePrint}
        onSave={handleSave}
      />

      <PrototypeNav screen={screen} onScreen={goScreen} onModal={setModal} />
    </>
  )
}
