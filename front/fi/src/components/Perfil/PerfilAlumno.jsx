

export const PerfilAlumno = () => {
    return (
        <>
            <section className="data-perfil">
                <div className="banner-perfil">
                    <i class="fa-solid fa-user"></i>
                    <p className="nombre-pefil">Juan Manuel Garcia</p>
                </div>

                <div className="datos-usuario-perfil">
                    <h3>Datos</h3>

                    <div className="d-flex">
                        <div className="legajo-perfil">
                            <h5><i class="fa-regular fa-address-card me-2"></i> Legajo</h5>
                            <span>45646546</span>
                        </div>

                        <div className="documento-perfil">
                            <h5><i class="fa-regular fa-address-card me-2"></i> Documento</h5>
                            <span>32656989</span>
                        </div>

                        <div className="correo-perfil">
                            <h5><i class="fa-regular fa-envelope me-2"></i> Correo</h5>
                            <span>juanmanuel@gmail.com</span>
                        </div>
                    </div>
                </div>

                <div className="catedras">
                    <h4><i class="fa-solid fa-book"></i>Cátedras cursando</h4>
                </div>
            </section>
        </>
    )
}
