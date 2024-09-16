import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
// import FormControlLabel from '@mui/material/FormControlLabel;
import Checkbox from '@mui/material/Checkbox';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import axios from "axios";
import { useState } from "react";
import { Modal } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useRole } from '../context/RolesContext';

const defaultTheme = createTheme();

export default function SignInSide() {
    const [mail, setMail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const navigate = useNavigate();
    const { setRole } = useRole();

    const handleSubmit = (e) => {
        e.preventDefault();

        axios.post('http://localhost:5000/auth/sign-in', {
            mail,
            password
        }, {
            withCredentials: true // Enviar las cookies
        })
            .then(response => {
                if (response.data && response.data.success) {
                    setRole(response.data.data.role)
                    setIsError(false);
                    setModalMessage('Login Exitoso! Redirigiendo...');
                    setShowModal(true);
                    navigate('/cursos')
                } else {
                    setIsError(true);
                    setModalMessage('Algo falló. Inténtalo de nuevo.');
                    setShowModal(true);
                }
            })
            .catch(err => {
                console.error("Error de autenticación", err);
                setIsError(true);
                setModalMessage('Error de autenticación. Inténtalo de nuevo.');
                setShowModal(true);
            });
    };

    const handleClose = () => {
        setShowModal(false);
        if (!isError) {
            navigate('/cursos'); // Redirigir a la pantalla de destino
        }
    };

    return (
        <ThemeProvider theme={defaultTheme}>
            <Grid container component="main" sx={{ height: '100vh' }}>
                <CssBaseline />
                <Grid
                    item
                    xs={false}
                    sm={4}
                    md={7}
                    sx={{
                        backgroundImage: 'url("/utn1.jpeg")',
                        backgroundColor: (t) =>
                            t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
                        backgroundSize: 'cover',
                        backgroundPosition: 'left',
                    }}
                />
                <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square sx={{ backgroundColor: '#f2f6fc' }}>
                    <Box
                        sx={{
                            my: 8,
                            mx: 4,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center'
                        }}
                    >
                        <Avatar sx={{ m: 1, bgcolor: '#CCDCF1', color: '#1A2035', border: '0.1rem solid #1A2035' }}>
                            <LockOutlinedIcon />
                        </Avatar>
                        <Typography component="h1" variant="h5" sx={{ marginBottom: '1.5rem' }}>
                            Entrar
                        </Typography>
                        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1 }}>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="email"
                                label="Email o Legajo"
                                name="email"
                                autoComplete="email"
                                autoFocus
                                value={mail}
                                onChange={(e) => setMail(e.target.value)}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            borderColor: '#1A2035', 
                                            borderRadius: '0.4rem', 
                                            borderWidth: '0.1rem'
                                        },
                                        '&:hover fieldset': {
                                            borderWidth: '0.1rem',
                                            borderColor: '#1a2035',
                                            textColor: '#1a2035'
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderWidth: '0.1rem',
                                            borderColor: '#1a2035'
                                        },
                                        '&.Mui-focused input': {
                                            color: '#1a2035'
                                        }
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: '#1a2035'
                                    }
                                }}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Contraseña"
                                type="password"
                                id="password"
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            borderColor: '#1A2035', 
                                            borderRadius: '0.4rem', 
                                            borderWidth: '0.1rem'
                                        },
                                        '&:hover fieldset': {
                                            borderWidth: '0.1rem',
                                            borderColor: '#1a2035',
                                            textColor: '#1a2035'
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderWidth: '0.1rem',
                                            borderColor: '#1a2035'
                                        },
                                        '&.Mui-focused input': {
                                            color: '#1a2035'
                                        }
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: '#1a2035'
                                    }
                                }}
                            />
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2 }}
                                style= {{ backgroundColor: '#1A2035', marginTop: '3rem' }}
                            >
                                Entrar
                            </Button>
                        </Box>
                    </Box>
                </Grid>
            </Grid>

            {/* Modal para mostrar el resultado del login */}
            <Modal
                open={showModal}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 300,
                    bgcolor: 'background.paper',
                    border: '2px solid #000',
                    boxShadow: 24,
                    p: 4,
                }}>
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                        {isError ? 'Error' : 'Éxito'}
                    </Typography>
                    <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                        {modalMessage}
                    </Typography>
                    <Button onClick={handleClose} sx={{ mt: 2 }} fullWidth variant="contained">
                        {isError ? 'Intentar de nuevo' : 'OK'}
                    </Button>
                </Box>
            </Modal>
        </ThemeProvider>
    );
}
