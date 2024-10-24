import '../styles/Perfil.css';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const PerfilAlumno = () => {
    const [perfil, setPerfil] = useState(null);
    const [cursos, setCursos] = useState([]);
    const [datosCargados, setDatosCargados] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const obtenerDatos = async () => {
            try {
                const responsePerfil = await axios.get('/usuarios/miPerfil', { withCredentials: true });
                setPerfil(responsePerfil.data.data);

                const responseCursos = await axios.get('/curso', { withCredentials: true });
                setCursos(responseCursos.data);

                setDatosCargados(true); // Marcar los datos como cargados
            } catch (error) {
                console.log('Error al obtener los datos del perfil:', error);
            }
        };

        if (!datosCargados) {
            obtenerDatos();
        }
    }, [datosCargados])
    if (!perfil) {
        console.log('Perfil no disponible, mostrando mensaje de carga...');
        return <div>Cargando...</div>;
    }

    return (
        <>
            <section className="data-perfil">
                <div className="nombre-perfil">
                    <i className="fa-solid fa-user"></i>
                    <h2>{perfil.nombre} {perfil.apellido}</h2>
                </div>

                <div className="datos-usuario-perfil">
                    <h3>Informacion general</h3>

                    <div className="d-flex">
                        <div className="legajo-perfil">
                            <h5><i className="fa-regular fa-address-card me-2"></i> Legajo</h5>
                            <span>{perfil.legajo}</span>
                        </div>

                        <div className="documento-perfil">
                            <h5><i className="fa-regular fa-address-card me-2"></i> Documento</h5>
                            <span>{perfil.dni}</span>
                        </div>

                        <div className="correo-perfil">
                            <h5><i className="fa-regular fa-envelope me-2"></i> Correo</h5>
                            <span>{perfil.email}</span>
                        </div>
                    </div>
                </div>

                <div className="catedras">
                    <h4><i className="fa-solid fa-book"></i>Cátedras cursando</h4>
                    <div className="materia">
                        {cursos.map(curso => (
                            <div key={curso.id}>
                                <div className='catedra-especifica' onClick={() => navigate(`/curso/${curso.id}`)}>
                                    <span>
                                    <strong>{curso.materia}</strong> <strong>Comisión {curso.comision}</strong> <em>{curso.anio}</em>
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
};