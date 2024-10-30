// Calendar.jsx
import React, { useState, useRef } from 'react';
import { Calendar as PCalendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { OverlayPanel } from 'primereact/overlaypanel';
import { addLocale } from 'primereact/api';
import './calendar.css';

// Configuración del locale en español
addLocale('es', {
    firstDayOfWeek: 1,
    dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
    dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
    dayNamesMin: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
    monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    today: 'Hoy',
    clear: 'Limpiar'
});

const Calendar = ({ onMonthChange, specialDays = [] }) => {
    const [date, setDate] = useState(new Date());
    const op = useRef(null);
    const buttonRef = useRef(null);

    const isSpecialDay = (day) => {
        return specialDays.find(sd => sd.day === day);
    };

    const dateTemplate = (dateObj) => {
        const specialDay = isSpecialDay(dateObj.day);
        if (specialDay && !dateObj.otherMonth) {
            return (
                <div className={'date'}
                    title={specialDay.fullDescription}
                    style={{
                        backgroundColor: specialDay.color,
                        width: '1.9rem',
                        height: '1.9rem',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: 'auto',
                        fontSize: '1.2rem'
                    }}
                >
                    {dateObj.day}
                </div>
            );
        }

        return dateObj.day;
    };

    const references = (
        <div className="mt-2 pt-2 border-t-1 border-gray-200">
            <div className="flex flex-wrap gap-2">
                {specialDays.map((special, index) => (
                    <div key={index} className="flex items-center gap-1">
                        <div
                            style={{
                                width: '0.8rem',
                                height: '0.8rem',
                                borderRadius: '50%',
                                backgroundColor: special.color,
                                display: 'inline-block'
                            }}
                        />
                        <span style={{ fontSize: '0.8rem', color: '#495057' }}>
                            {special.description}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="calendar-wrapper">
            <Button
                ref={buttonRef}
                icon="pi pi-calendar"
                onClick={(e) => op.current.toggle(e)}
                className="p-button-text"
                label="Calendario"
            />

            <OverlayPanel
                ref={op}
                showCloseIcon
                style={{ padding: '0.5rem', width: '30rem' }}
                appendTo={document.body}
                breakpoints={{ '960px': '75vw', '640px': '100vw' }}
                position="bottom"
            >
                <div className="calendar-container">
                    <PCalendar
                        inline
                        value={date}
                        onChange={(e) => setDate(e.value)}
                        dateTemplate={dateTemplate}
                        onMonthChange={(e) => onMonthChange(e.month + 1)} // Aquí se llama a la función con el mes actualizado
                        showWeek={false}
                        monthNavigator
                        yearNavigator
                        yearRange={`${new Date().getFullYear()}:${new Date().getFullYear()}`}
                        locale="es"
                        firstDayOfWeek={1}
                        showButtonBar={false}
                        style={{
                            width: '100%',
                            '.p-datepicker': {
                                fontSize: '0.2rem'
                            }
                        }}
                    />
                    {references}
                </div>
            </OverlayPanel>
        </div>
    );
};

export default Calendar;
