import React from 'react'; 
import { TabView, TabPanel } from 'primereact/tabview';
import './Rendimiento.css'

function Rendimiento() {
    return (
        <div className='rendimiento-container'>
            <div>
                <TabView className="tabs-container">
                    <TabPanel className='tab-header-text' header="Alumnos">
                        <p className="m-0">
                            Acá va el rendimiento del alumno
                        </p>
                    </TabPanel>
                    <TabPanel className='tab-header-text' header="Grupos">
                        <p className="m-0">
                            Acá va el rendimiento del grupo
                        </p>
                    </TabPanel>
                    <TabPanel className='tab-header-text' header="Asistencia">
                        <p className="m-0">
                            Acá va el rendimiento con respecto a la asistencia
                        </p>
                    </TabPanel>
                </TabView>
            </div>
        </div>
    )
}

export default Rendimiento