import Icon from '../Icon.jsx'
import { useApp } from '../../context/AppContext.jsx'

// Right-hand slide-over drawer + backdrop scrim. Content is any React node
// passed to openDrawer(node).
export default function Drawer() {
  const { drawer, closeDrawer } = useApp()
  return (
    <>
      <div className={`scrim ${drawer ? 'show' : ''}`} onClick={closeDrawer} />
      <aside className={`drawer ${drawer ? 'show' : ''}`} role="dialog" aria-modal="true">
        {drawer && (
          <>
            <button className="icon-btn drawer-close" onClick={closeDrawer} aria-label="Close">
              <Icon name="x" size={16} />
            </button>
            {drawer}
          </>
        )}
      </aside>
    </>
  )
}
