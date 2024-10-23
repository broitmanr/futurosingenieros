import '../styles/Perfil.css';
import { IoCheckboxSharp } from "react-icons/io5";
import { GrEdit } from "react-icons/gr";
import { BiSolidCaretRightSquare } from "react-icons/bi";

export const PerfilDocente = () => {
    return (
        <>
            <section className="data-perfil">
            <div className="nombre-perfil">
                    <i class="fa-solid fa-user"></i>
                    <h2>Victoria Heredia</h2>
                </div>

                <div className="datos-usuario-perfil">
                    <h3>Informacion general</h3>

                    <div className="d-flex">
                        <div className="legajo-perfil">
                            <h5><i class="fa-regular fa-address-card me-2"></i> Legajo</h5>
                            <span>30280</span>
                        </div>

                        <div className="documento-perfil">
                            <h5><i class="fa-regular fa-address-card me-2"></i> Documento</h5>
                            <span>42055128</span><GrEdit className="icono-editar" />
                        </div>

                        <div className="correo-perfil">
                            <h5><i class="fa-regular fa-envelope me-2"></i> Correo</h5>
                            <span>lesliemonges@gmail.com</span><GrEdit className="icono-editar" />
                        </div>
                    </div>
                </div>

                <div className="catedras">
                    <h4><i class="fa-solid fa-book"></i>Cátedras cargo</h4>
                    <div className="materia">
                        <span>Diseño de sistemas - Comisión s31</span>
                        <span>Proyecto final - Comision s51</span>
                        <span>Inteligencia artificial - Comision s51</span>
                    </div>
                    
                </div>
            </section>
        </>
    )
}
