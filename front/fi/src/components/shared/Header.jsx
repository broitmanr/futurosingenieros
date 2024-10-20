import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom'
import { useRole } from '../../context/RolesContext';
import { FaUserCircle } from "react-icons/fa";
import './SharedStyles.css'
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
//import { ButtonGroup } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
    const { role, setRole } = useRole()
    const navigate = useNavigate()
    const [ dropdownUserVisible, setDropdownUserVisible ] = useState(false)
    const dropdownUserRef = useRef(null)
    const { isLoggedIn, setIsLoggedIn } = useAuth()

    useEffect(() => { //Redirección logo
        if(role && location.pathname === '/') {
            navigate('/cursos')
        }
    }, [role, navigate, location.pathname])

    const toogleDropdownUser = () => {
        setDropdownUserVisible(!dropdownUserVisible)
    }

    const handleLogOut = async () => {
        try {
            const response = await axios.post('http://localhost:5000/auth/sign-out', { withCredentials: true })
            if(response){
                setDropdownUserVisible(false)
                setRole('')
                setIsLoggedIn(false)
                localStorage.removeItem('role')
                navigate('/login')
            }
        }catch(err){
            console.log('No se logró cerrar sesión:', err)
        }
    }

    const handleClickOpen = (e) => {
        if(dropdownUserRef.current && !dropdownUserRef.current.contains(e.target)) {
            setDropdownUserVisible(false)
        }
    }

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOpen)
        return () => {
            document.removeEventListener('mousedown', handleClickOpen)
        }
    }, [])

    return ( 
        <React.Fragment>
            <nav className="navbar-header-container navbar-expand-lg" data-bs-theme="dark" >
                <div className="container-fluid d-flex justify-content-between align-items-center">
                    {/*Cambié href*/}
                    <Link className="navbar-brand" to={role ? '/cursos' : '/' }>
                        {/*Ajusta tamaño de imagen según altura */}
                        <img className='navbar-logo' src="/logoFrlp.png" alt="Logo" />
                    </Link>
                    <div className="navbar-brand-text-container position-absolute d-none d-lg-block">
                        FUTUROS INGENIEROS
                    </div>
                    {/* Se añade para que sea responsive */}
                    <div className="navbar-brand-text d-lg-none">
                        FUTUROS INGENIEROS
                    </div>
                    { role && (
                        <div className='user-items-container'> 
                            <Dropdown show={dropdownUserVisible} ref={dropdownUserRef} onToggle={toogleDropdownUser}>
                                <Dropdown.Toggle className='dropdown-toogle-user' as={FaUserCircle} size={32} />
                                <Dropdown.Menu className='dropdown-menu-user' align={{ lg: 'end' }} flip={true} >
                                    <Dropdown.Item className='dropdown-item-user' eventKey="1" onClick={handleLogOut}>Cerrar sesión</Dropdown.Item>    
                                </Dropdown.Menu>
                            </Dropdown>
                        </div>
                    )}
                </div>
            </nav>
        </React.Fragment>
    )
}

export default Header