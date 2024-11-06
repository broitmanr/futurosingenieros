import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'primereact/button';
import { ProgressBar } from 'primereact/progressbar';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';
import { InputNumber } from 'primereact/inputnumber';
import { Divider } from 'primereact/divider';
import { Users, Percent, ChevronUp, ChevronDown } from 'lucide-react';
import PropTypes from 'prop-types';
import './PorcentajeParticipacion.css';

const PorcentajeParticipacion = ({ participantes, porcentajes, handlePorcentajeChange, totalPorcentaje, handleSubmit }) => {
    const toast = useRef(null);
    const [initialPorcentajes, setInitialPorcentajes] = useState({});

    useEffect(() => {
        // Almacenar los valores iniciales de los porcentajes cuando se cargan por primera vez
        const initialValues = {};
        participantes.forEach(participante => {
            initialValues[participante.personaId] = parseFloat(porcentajes[participante.personaId] || 0);
        });
        setInitialPorcentajes(initialValues);
    }, [participantes]);

    const showToast = (severity, summary, detail) => {
        toast.current.show({
            severity,
            summary,
            detail,
            life: 3000
        });
    };

    const handleSubmitWithValidation = async () => {
        if (totalPorcentaje !== 100) {
            showToast('error', 'Error', 'Los porcentajes deben sumar exactamente 100%');
            return;
        }

        // Comparar los valores actuales con los valores iniciales
        const hasChanges = Object.keys(porcentajes).some(personaId => parseFloat(porcentajes[personaId]) !== parseFloat(initialPorcentajes[personaId]));

        if (!hasChanges) {
            showToast('warn', 'Advertencia', 'No se realizaron cambios en los porcentajes');
            return;
        }

        try {
            await handleSubmit();
            showToast('success', 'Éxito', 'Porcentajes actualizados correctamente');

            // Actualizar los valores iniciales después de un PATCH exitoso
            const updatedInitialValues = {};
            Object.keys(porcentajes).forEach(personaId => {
                updatedInitialValues[personaId] = parseFloat(porcentajes[personaId]);
            });
            setInitialPorcentajes(updatedInitialValues);
        } catch (error) {
            showToast('error', 'Error', 'No se pudieron actualizar los porcentajes');
        }
    };

    const getProgressBarColor = () => {
        if (totalPorcentaje === 100) return '#4CAF50';
        if (totalPorcentaje > 100) return '#f44336';
        return '#344474';
    };

    return (
        <Card className="participation-section">
            <Toast ref={toast} />
            
            <div className="participation-header flex items-center gap-2">
                <Users className="text-[#344474]" size={20} />
                <h3 className="m-0">
                    Porcentajes de Participación
                </h3>
            </div>
            
            <Divider className="my-4" />
            
            <div className="participation-grid">
                {participantes.map(participante => (
                    <div key={participante.personaId} className="participant-row">
                        <span className="participant-name">
                            {participante.nombre} {participante.apellido}
                        </span>
                        <div className="percentage-input-container">
                        <InputNumber
                            value={porcentajes[participante.personaId] || 0}
                            onValueChange={(e) => handlePorcentajeChange(participante.personaId, e.value)}
                            mode="decimal"
                            minFractionDigits={0}
                            maxFractionDigits={2}
                            min={0}
                            max={100}
                            size={5}
                            suffix="%"
                            showButtons
                            buttonLayout="vertical"
                            incrementButtonIcon={<ChevronUp size={12} />}
                            decrementButtonIcon={<ChevronDown size={12} />}
                            step={0.5}
                        />
                        </div>
                    </div>
                ))}
            </div>

            <div className="progress-section">
                <div className="progress-header">
                    <span className="progress-label">Progreso Total</span>
                    <div className="flex items-center gap-1" style={{ marginRight: '1rem' }}>
                        <Percent size={14} className="text-[#344474]" />
                        <span className={`progress-percentage ${
                            totalPorcentaje === 100 ? 'complete' : 
                            totalPorcentaje > 100 ? 'over' : 'incomplete'
                        }`}>
                            {totalPorcentaje}%
                        </span>
                    </div>
                </div>
                <ProgressBar 
                    value={totalPorcentaje} 
                    showValue={false}
                    style={{ backgroundColor: getProgressBarColor() }}
                />
            </div>

            <div className="flex justify-end mt-4">
                <Button
                    label="Guardar porcentajes"
                    icon="pi pi-check"
                    onClick={handleSubmitWithValidation}
                    className="save-button"
                    disabled={totalPorcentaje !== 100}
                />
            </div>
        </Card>
    );
};

PorcentajeParticipacion.propTypes = {
    participantes: PropTypes.arrayOf(PropTypes.shape({
        personaId: PropTypes.number.isRequired,
        nombre: PropTypes.string.isRequired,
        apellido: PropTypes.string.isRequired
    })).isRequired,
    porcentajes: PropTypes.object.isRequired,
    handlePorcentajeChange: PropTypes.func.isRequired,
    totalPorcentaje: PropTypes.number.isRequired,
    handleSubmit: PropTypes.func.isRequired
};

export default PorcentajeParticipacion;