describe('Flujo de autenticación', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173', { timeout: 20000 }) // 20 segundos de espera
  })

  it('Debería seguir el flujo completo de autenticación', () => {
    // Verificar redirección a landing page cuando no está autenticado
    cy.url().should('include', '/')

    // Hacer clic en el botón comenzar
    cy.get('[data-testid="start-button"]').click()

    // Verificar redirección a login
    cy.url().should('include', '/login')

    // Cargar datos de prueba
    cy.fixture('testData.json').then((testData) => {
      const { mail, password } = testData.usuarioAlumno

      // Llenar formulario de login
      cy.get('[data-testid="email-input"]').type(mail)
      cy.get('[data-testid="password-input"]').type(password)
      cy.get('[data-testid="login-button"]', { timeout: 20000 }).click() // Aumentar el tiempo de espera

      // Verificar redirección a la página de cursos
      cy.url().should('include', '/cursos')
    })
  })
})
