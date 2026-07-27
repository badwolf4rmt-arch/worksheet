import './Loader.css'

interface LoaderProps {
  title?: string
  onHome?: () => void
}

export function Loader({ title = 'Закрепление материала', onHome }: LoaderProps) {
  return (
    <div className="loader-page">
      <header className="ws-navbar">
        <nav className="breadcrumbs" aria-label="Навигация">
          <button type="button" onClick={onHome}>
            Главная
          </button>
          <span>/</span>
          <button type="button" onClick={onHome}>
            Рабочие листы
          </button>
          <span>/</span>
          <span className="current">{title}</span>
        </nav>
      </header>
      <div className="loader-center">
        <span className="spinner" aria-hidden />
        <p>Думаю над темой</p>
      </div>
    </div>
  )
}
