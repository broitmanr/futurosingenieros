

export const DetalleEntrega = () => {
    return (
        <>

            <section className="seccionBanner py-5">
                <div className="container">
                    <div className="row">
                        <div className="col-md-6 mx-auto border border-5 p-4">

                            <h2 className="nombre-materia text-center">Plan de gestión del cronograma</h2>
                            <p>Desarrollar el Cronograma, según el ciclo de vida elegido por el grupo.
                                066-Cronograma del
                                Proyecto</p>

                        </div>
                    </div>
                </div>


            </section>

            <section className="seccion-detalle-entrega py-4">
                <div className="container">
                <h2>Datos de la entrega:</h2>
                </div>
               
            </section>
            <div className="container">
                    <div className="row">
                        <div className="col-md-3 mx-auto border border-5 p-2 borde-negro">

                        <h3
                            className="nombre-materia"
                            style={{
                                fontSize: '18px',
                                fontWeight: 'bold',
                                color: '#333',
                                fontFamily: 'Arial, sans-serif',
                                textAlign: 'center'
                            }}
                            >
                            Plan de gestión del cronograma
                        </h3>
                        <p style={{ fontSize: '16px' }}>
                            <span style={{ fontWeight: 'bold' }}>Estado:</span> aprobada
                        </p>
                        <p style={{ fontSize: '16px' }}>
                            <span style={{ fontWeight: 'bold' }}>Fecha de vencimiento:</span> 17/08/2023
                        </p>
                        <p style={{ fontSize: '16px' }}>
                            <span style={{ fontWeight: 'bold' }}>Fecha de entrega:</span> 10/08/2023
                        </p>
                        </div>
                    </div>
                </div>

        </>
    )
}
