const axios = require('axios')

const checkServers = async () => {
    try {
        // Verificar que el frontend esté funcionando
        await axios.get('http://localhost:5173/')
        console.log('✓ Frontend está corriendo en http://localhost:5173')
    } catch (error) {
        console.error('✗ Frontend no está disponible. Por favor, inicia el servidor Vite (cd ../front && npm run dev)')
        process.exit(1)
    }

    try {
        // Verificar que el backend esté funcionando
        await axios.get('http://localhost:5000/api/health')
        console.log('✓ Backend está corriendo en http://localhost:5000')
    } catch (error) {
        console.error('✗ Backend no está disponible. Por favor, inicia el servidor Express (cd ../back && npm run start)')
        console.log('error:', error)
        process.exit(1)
    }
}

checkServers()
