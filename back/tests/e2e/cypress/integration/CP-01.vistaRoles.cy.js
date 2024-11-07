describe('CP-01: Acceso a la funcionalidad de crear curso por rol', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173', { timeout: 20000 })
  })

  it('Debería permitir al docente ver la opción de "Agregar curso"', () => {
    cy.fixture('testData.json').then((testData) => {
      const { mail, password } = testData.usuarioDocente

      // Login como docente
      cy.get('[data-testid="start-button"]').click()
      cy.url().should('include', '/login')
      cy.get('[data-testid="email-input"]').type(mail)
      cy.get('[data-testid="password-input"]').type(password)
      cy.get('[data-testid="login-button"]').click()

      // Verificar redirección a cursos
      cy.url().should('include', '/cursos')

      // Verificar que el docente puede ver la opción de "Agregar curso"
      cy.get('[data-cy="boton-agregar-curso"]').should('be.visible')
    })
  })

  it('No debería permitir al alumno ver la opción de "Agregar curso"', () => {
    cy.fixture('testData.json').then((testData) => {
      const { mail, password } = testData.usuarioAlumno

      // Login como alumno
      cy.get('[data-testid="start-button"]').click()
      cy.url().should('include', '/login')
      cy.get('[data-testid="email-input"]').type(mail)
      cy.get('[data-testid="password-input"]').type(password)
      cy.get('[data-testid="login-button"]').click()

      // Verificar redirección a cursos
      cy.url().should('include', '/cursos')

      // Verificar que el alumno no puede ver la opción de "Agregar curso"
      cy.get('[data-cy="boton-agregar-curso"]').should('not.exist')
    })
  })
})
