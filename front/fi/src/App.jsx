import { useState } from 'react'
import reactLogo from './assets/react.svg'
import logo from '/logo2.png'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <img src={logo} className="logo" alt="Futuros Ingenieros Logo" />
      </div>
      <h1>Futuros Ingenieros</h1>
      <p className="read-the-docs">
        Estamos trabajando para vos
      </p>
    </>
  )
}

export default App
