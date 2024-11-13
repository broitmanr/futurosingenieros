import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useRole } from '../../context/RolesContext';
import { FaRegUserCircle } from "react-icons/fa";
import './SharedStyles.css';
import Dropdown from 'react-bootstrap/Dropdown';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { GoSignOut } from "react-icons/go";
import { CgProfile } from "react-icons/cg";
import { FaRegBell } from "react-icons/fa6";
import { Badge } from 'primereact/badge';
import moment from "moment";
import { PiGraduationCapDuotone } from "react-icons/pi";

const Header = () => {
    const { role, setRole } = useRole();
    const [nombre, setNombre] = useState('')
    const navigate = useNavigate();
    const [dropdownUserVisible, setDropdownUserVisible] = useState(false);
    const dropdownUserRef = useRef(null);
    const dropdownNotificationsRef = useRef(null);
    const { userData, setIsLoggedIn } = useAuth();
    const [hasNotifications, setHasNotifications] = useState(false);
    const [notificaciones, setNotificaciones] = useState([]); // Estado para notificaciones
    const [dropdownNotificacionesVisible, setDropdownNotificacionesVisible] = useState(false); // Para mostrar las notificaciones

    useEffect(() => {
        if (role && location.pathname === '/') {
            navigate('/cursos');
        }
    }, [role, navigate, location.pathname]);

    /*new*/
    const handleProfileClick = () => {
        if (role === 'A') {  // Si el rol es alumno
            navigate('/perfil/alumno'); // Redirige a la página de perfil de alumno
        } else if (role === 'D') {
            navigate('/perfil/docente');
        }
    }

    const toogleDropdownUser = () => {
        setDropdownUserVisible(!dropdownUserVisible);
    }

    const toogleDropdownNotificaciones = () => {
        setDropdownNotificacionesVisible(!dropdownNotificacionesVisible)
    }

    useEffect(() => { //Filtra el nombre del usuario para la bienvenida
        if (userData) {
            setNombre(userData.name)
        }
    }, [userData])

    const handleLogOut = async () => {
        try {
            const response = await axios.post('http://localhost:5000/auth/sign-out', { withCredentials: true })
            if (response) {
                setDropdownUserVisible(false)
                setRole('')
                setIsLoggedIn(false)
                localStorage.removeItem('role')
                localStorage.removeItem('userData')
                navigate('/login')
            }
        } catch (err) {
            console.log('No se logró cerrar sesión:', err)
        }
    }

    const handleClickOpen = (e) => {
        const isUserOpen = dropdownUserRef.current && dropdownUserRef.current.contains(e.target)
        const isNotificationsOpen = dropdownNotificationsRef.current && dropdownNotificationsRef.current.contains(e.target)
        if (!isUserOpen){ //Manejo del cierre del drop del user
            setDropdownUserVisible(false);
        }
        if(!isNotificationsOpen){ //Manejo del cierre del drop de las notificaciones
            setDropdownNotificacionesVisible(false);
        }
    }; 

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOpen)
        return () => {
            document.removeEventListener('mousedown', handleClickOpen)
        }
    }, [])

    const obtenerNotificaciones = async () => {
        try {
            const response = await axios.get('/notificacion', { withCredentials: true })
            setNotificaciones(response.data)
            setHasNotifications(response.data.some(notif => !notif.leido))
        } catch (error) {
            console.log('Error al obtener las notificaciones:', error)
        }
    }
    // Obtener las notificaciones al montar el componente
    useEffect(() => {

        obtenerNotificaciones()

        const interval = setInterval(obtenerNotificaciones, 15000);

        // Limpia el intervalo cuando el componente se desmonte
        return () => clearInterval(interval);
    }, [])



    // Marcar notificación como leída
    const marcarComoLeida = async (id) => {
        try {
            await axios.patch(`/notificacion/${id}`, {}, { withCredentials: true })
            setNotificaciones(prev =>
                prev.map(notif => notif.id === id ? { ...notif, leido: true } : notif)
            )
            obtenerNotificaciones()
        } catch (error) {
            console.log('Error al marcar la notificación como leída:', error)
        }
    }

    return (
        <React.Fragment>
            <nav className="navbar-header-container navbar-expand-lg" data-bs-theme="dark">
                <div className="container-fluid d-flex justify-content-between align-items-center">
                    <Link className="navbar-brand" to={role ? '/cursos' : '/'}>
                        <img className='navbar-logo' src="/logoFrlp.png" alt="Logo" />
                    </Link>
                    <div className="navbar-brand-text-container position-absolute d-none d-lg-block">
                        <PiGraduationCapDuotone className='btn-fi-icon' color="#fff" size={22} />
                        FUTUROS INGENIEROS
                    </div>
                    <div className="navbar-brand-text d-lg-none">
                        <PiGraduationCapDuotone className='btn-fi-icon' color="#fff" size={22} />
                        FUTUROS INGENIEROS
                    </div>
                    {role && (
                        <div className='user-items-container'>
                            {/* Icono de notificaciones */}
                            <div className='flex flex-wrap justify-content-center gap-4' ref={dropdownNotificationsRef}>
                                <i className="p-overlay-badge icon-notifications-container" onClick={toogleDropdownNotificaciones}>
                                    <FaRegBell color='#fff' size={32} />
                                    {hasNotifications && <Badge className='badge-notificacions-position' value={notificaciones.filter(n => !n.leido).length} severity="danger"></Badge>}
                                </i>
                                {/* Dropdown de notificaciones */}
                                {dropdownNotificacionesVisible && (
                                    <div className="dropdown-notificaciones">
                                        <span>Notificaciones</span>
                                        {notificaciones.length === 0 ? (
                                            <p>No hay notificaciones</p>
                                        ) : (
                                            notificaciones
                                            .sort((a, b) => (a.leido === b.leido ? 0 : a.leido ? 1 : -1))
                                            .map((notificacion) => (
                                                <div
                                                    key={notificacion.id}
                                                    className={`notificacion-item ${notificacion.leido ? 'leida' : 'no-leida'}`}
                                                    onClick={() => marcarComoLeida(notificacion.ID)}
                                                >
                                                    <p>{notificacion.detalle} - <small>{moment(notificacion.fecha).format('DD/MM/YY')}</small> </p>

                                                </div>
                                            ))
                                        )}
                                        {/*<Link to="/todas-las-notificaciones">Ver todas</Link>*/}
                                    </div>
                                )}
                            </div>
                            <div className='user-data-header-container'>
                                <Dropdown show={dropdownUserVisible} ref={dropdownUserRef} onToggle={toogleDropdownUser}>
                                    <Dropdown.Toggle className='dropdown-toogle-user' as={FaRegUserCircle} size={32} data-cy="perfil-icon"/>
                                    <Dropdown.Menu className='dropdown-menu-user'>
                                    <Dropdown.Item className='dropdown-item-user' eventKey="1" onClick={handleProfileClick}>
                                            <CgProfile size={24} /> Mi perfil
                                        </Dropdown.Item>
                                        <Dropdown.Item className='dropdown-item-user' eventKey="2" onClick={handleLogOut}><GoSignOut size={24}  data-cy="logout"  /> Cerrar sesión</Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                                <span className='user-name'>{nombre}</span>
                            </div>
                        </div>
                    )}
                </div>
            </nav>
        </React.Fragment>
    );
};

export default Header;
