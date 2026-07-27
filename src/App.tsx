import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { PrototypeNav } from '@/components/PrototypeNav'
import { createDemoWorksheet } from '@/data/worksheet'
import type { Modal, Screen, WorksheetBlock, WorksheetDraft } from '@/data/worksheet'
import { Home } from '@/screens/Home'
import { Create } from '@/screens/Create'
import { Loader } from '@/screens/Loader'
import { WorksheetScreen } from '@/screens/Worksheet'
import { Modals } from '@/screens/Modals'

export default function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [createMode, setCreateMode] = useState<'generate' | 'manual'>('generate')
  const [draft, setDraft] = useState<WorksheetDraft>(() =>
    createDemoWorksheet('Закрепление материала'),
  )
  const [modal, setModal] = useState<Modal>(null)
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)

  useEffect(() => {
    if (screen !== 'loader') return
    const t = window.setTimeout(() => {
      setDraft((d) => createDemoWorksheet(d.topic || d.title || 'Закрепление материала'))
      setScreen('preview')
    }, 2200)
    return () => window.clearTimeout(t)
  }, [screen])

  useEffect(() => {
    if (screen === 'create-manual') setCreateMode('manual')
    if (screen === 'create') setCreateMode('generate')
    if (screen === 'edit-widget' && !selectedBlockId && draft.blocks[0]) {
      setSelectedBlockId(draft.blocks[0].id)
    }
  }, [screen, selectedBlockId, draft.blocks])

  const openCreate = () => {
    setDraft({
      subject: '',
      grade: '',
      taskCount: '6',
      topic: '',
      wishes: '',
      title: '',
      intro: '',
      blocks: [],
    })
    setCreateMode('generate')
    setScreen('create')
  }

  const submitCreate = () => {
    if (createMode === 'manual') {
      setDraft((d) => ({
        ...d,
        title: d.topic || 'Новый рабочий лист',
        intro: '',
        blocks: [
          {
            id: `b-${Date.now()}`,
            type: 'open',
            title: 'Задание 1',
            body: 'Введите условие задания…',
            difficulty: 1,
          },
        ],
      }))
      setScreen('edit')
      return
    }
    setDraft((d) => ({
      ...d,
      title: d.topic || 'Закрепление материала',
    }))
    setScreen('loader')
  }

  const updateBlock = (block: WorksheetBlock) => {
    setDraft((d) => ({
      ...d,
      blocks: d.blocks.map((b) => (b.id === block.id ? block : b)),
    }))
  }

  const addBlock = (type: WorksheetBlock['type']) => {
    const id = `b-${Date.now()}`
    const labels: Record<WorksheetBlock['type'], string> = {
      text: 'Текст',
      open: 'Открытый вопрос',
      lines: 'Линии',
      grid: 'Клетка',
      answer: 'Выбор ответа',
      image: 'Картинка',
      'text-image': 'Текст + картинка',
    }
    const next: WorksheetBlock = {
      id,
      type,
      title: labels[type],
      body: type === 'answer' || type === 'open' ? 'Введите условие задания' : 'Текст блока',
      options: type === 'answer' ? ['Вариант A', 'Вариант B', 'Вариант C'] : undefined,
      answer: type === 'answer' ? 'Вариант A' : undefined,
      difficulty: 1,
    }
    setDraft((d) => ({ ...d, blocks: [...d.blocks, next] }))
    setSelectedBlockId(id)
    setScreen('edit-widget')
  }

  const removeBlock = (id: string) => {
    setDraft((d) => ({ ...d, blocks: d.blocks.filter((b) => b.id !== id) }))
    setSelectedBlockId(null)
    setScreen('edit')
  }

  const goScreen = (next: Screen) => {
    if (next === 'create-manual') setCreateMode('manual')
    if (next === 'create') setCreateMode('generate')
    if (
      (next === 'preview' ||
        next === 'edit' ||
        next === 'show-answers' ||
        next === 'edit-widget' ||
        next === 'add-block') &&
      draft.blocks.length === 0
    ) {
      setDraft(createDemoWorksheet('Закрепление материала'))
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

      {screen === 'create' || screen === 'create-manual' ? (
        <Create
          mode={createMode}
          draft={draft}
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
          title={draft.title || draft.topic || 'Закрепление материала'}
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
          onSelectBlock={(id) => {
            setSelectedBlockId(id)
            setScreen(id ? 'edit-widget' : 'edit')
          }}
          onChangeBlock={updateBlock}
          onChangeDraft={setDraft}
          onAddBlock={addBlock}
          onRemoveBlock={removeBlock}
          onBack={() => setScreen('home')}
          onEdit={() => setScreen('edit')}
          onPreview={() => setScreen('preview')}
          onConvert={() => setModal('convert')}
          onDownload={() => setModal('download')}
          onMenu={() => setModal('menu')}
          onSettings={() => setModal('settings')}
          onShowAnswers={() =>
            setScreen((s) => (s === 'show-answers' ? 'preview' : 'show-answers'))
          }
          onAddBlockOpen={() => setScreen('add-block')}
          onCloseAddBlock={() => setScreen('edit')}
        />
      ) : null}

      <Modals
        modal={modal}
        draft={draft}
        onClose={() => setModal(null)}
        onOpen={setModal}
        onConfirmConvert={() => setModal('convert-success')}
        onConfirmDuplicate={() => {
          setDraft((d) => ({ ...d, title: `${d.title} (копия)` }))
          setModal(null)
        }}
        onConfirmDelete={() => {
          setModal(null)
          setScreen('home')
        }}
        onConfirmRegenerate={() => {
          setModal(null)
          setScreen('loader')
        }}
      />

      <PrototypeNav screen={screen} onScreen={goScreen} onModal={setModal} />
    </>
  )
}
