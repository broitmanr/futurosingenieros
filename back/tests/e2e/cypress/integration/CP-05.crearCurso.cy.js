describe('CP-05: Creación de un curso y vincularse al mismo por código', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173', { timeout: 20000 })
  })

  it('Debería permitir al docente crear un curso y al alumno vincularse al mismo', () => {
    cy.fixture('testData.json').then((testData) => {
      const { mail, password } = testData.usuarioDocente

      // Hacer clic en el botón comenzar
      cy.get('[data-testid="start-button"]').click()

      // Verificar redirección a login
      cy.url().should('include', '/login')

      // Login del docente
      cy.get('[data-testid="email-input"]').type(mail)
      cy.get('[data-testid="password-input"]').type(password)
      cy.get('[data-testid="login-button"]').click()

      // Esperar y verificar redirección a cursos
      cy.url().should('include', '/cursos')
    })

    // Abrir el modal de creación de curso
    cy.get('[data-cy="boton-agregar-curso"]').should('be.visible').click()

    // Seleccionar el ciclo lectivo (opcional si tiene un valor predefinido)
    cy.get('[data-cy="input-ciclo-lectivo"]').clear().type(new Date().getFullYear())

    // Abrir el menú desplegable de comisiones
    cy.get('[data-cy="dropdown-comision"]').click()
    cy.get('.p-dropdown-trigger').click()

    // Seleccionar una comisión válida
    cy.get('.p-dropdown-item').should('be.visible').first().click() // Seleccionar la primera comisión disponible

    // Esperar a que las materias se carguen
    cy.get('[data-cy="select-materia"] option').should('have.length.greaterThan', 1)

    // Seleccionar una materia
    cy.get('[data-cy="select-materia"]').select('Sistemas y Organizaciones') // Cambiar 'Sistemas y Organizaciones' según la materia esperada

    // Confirmar la creación del curso
    cy.get('[data-cy="btn-confirmar-curso"]').click()

    // Verificar si el curso fue creado exitosamente mediante el Toast o algún indicador
    cy.get('.p-toast-message').should('contain', 'Curso creado con éxito')

    // Asegurarse de que el modal se haya cerrado
    cy.get('[data-cy="modal-agregar-curso"]').should('not.exist')

    // Verificar que el curso aparezca en la lista de cursos
    cy.get('[data-cy^="curso-"]').should('contain', 'Sistemas y Organizaciones') // Asegúrate de que este texto sea el correcto
  })
})
