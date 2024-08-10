import { useState } from 'react'
import reactLogo from './assets/react.svg'
import logo from '/logo2.png'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <article className='tw-follow'>
        <header className='tw-follow-header'>
            <img className='tw-follow-avatar' src="https://unavatar.io/midudev" />
            <div className='tw-follow-info'>
                <strong>Alberto Fernandez</strong>
                <span>@Albert</span>
            </div>
        </header>
        <aside>
            <button>
                Seguir
            </button>
        </aside>

    </article>
  )
}

export default App
