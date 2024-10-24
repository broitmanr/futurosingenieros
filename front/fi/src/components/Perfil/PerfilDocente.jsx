import '../styles/Perfil.css';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { GrEdit } from "react-icons/gr";
import { useNavigate } from 'react-router-dom';

export const PerfilDocente = () => {
    const [perfil, setPerfil] = useState(null);
    const [catedras, setCatedras] = useState([]);
    const [datosCargados, setDatosCargados] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const obtenerDatos = async () => {
            try {
                const responsePerfil = await axios.get('/usuarios/miPerfil', { withCredentials: true });
                setPerfil(responsePerfil.data.data);

                const responseCatedras = await axios.get('/curso', { withCredentials: true });
                setCatedras(responseCatedras.data);

                setDatosCargados(true);
            } catch (error) {
                console.log('Error al obtener los datos del perfil:', error);
            }
        };

        if (!datosCargados) {
            obtenerDatos();
        }
    }, [datosCargados])

    if (!perfil) {
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
                    <h4><i className="fa-solid fa-book"></i>Cátedras cargo</h4>
                    <div className="materia">
                        {catedras.map(catedra => (
                            <div className='catedra-especifica' key={catedra.id} onClick={() => navigate(`/curso/${catedra.id}`)}>
                                <span>
                                    <strong>{catedra.materia}</strong> - <strong>Comisión {catedra.comision}</strong> <em>{catedra.anio}</em>
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
};