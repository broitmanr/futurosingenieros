describe('CP-05: Creación de un curso y vincularse al mismo por código', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173', { timeout: 20000 })
  })

  it('Debería permitir al docente crear un curso y al alumno vincularse al mismo', () => {
    cy.url().should('include', '/')
    cy.intercept('POST', '/auth/sign-in').as('signIn')

    // Login como docente
    cy.get('[data-testid="start-button"]').click()
    cy.url().should('include', '/login')

    cy.fixture('testData.json').then((testData) => {
      const { mail, password } = testData.usuarioDocente

      // Login del docente
      cy.get('[data-testid="email-input"]').type(mail)
      cy.get('[data-testid="password-input"]').type(password)
      cy.get('[data-testid="login-button"]').click()

      // Esperar y verificar redirección a cursos
      cy.intercept('GET', '/api/comision').as('getComision')
      cy.wait('@getComision', { timeout: 30000 })
      cy.url().should('include', '/cursos')

      // Seleccionar el primer curso disponible y obtener su ID dinámicamente
      cy.get('[data-cy^="curso-"]').first().then(($curso) => {
        const cursoId = $curso.attr('data-cy').split('-')[1]

        // Interceptar la solicitud para el curso seleccionado
        cy.intercept('GET', `/api/curso/${cursoId}`).as('getCurso')
        cy.wrap(cursoId).as('cursoId')

        // Hacer clic en el curso seleccionado
        cy.get(`[data-cy=curso-${cursoId}]`).click()
        cy.wait('@getCurso', { timeout: 30000 })
        cy.url().should('include', `/curso/${cursoId}`)

        // Ir a la pestaña de alumnos
        cy.intercept('GET', `/api/curso/${cursoId}/miembros`).as('getMiembros')
        cy.get('[data-cy=alumnos-tab]').click()
        cy.wait('@getMiembros', { timeout: 30000 })
        cy.url().should('include', `/alumnos/${cursoId}`)

        // Generar código de vinculación
        cy.intercept('POST', '/api/curso/generar-codigo').as('generarCodigo')
        cy.get('[data-cy=btn-generar-codigo]').click()
        cy.wait('@generarCodigo', { timeout: 30000 })

        // Capturar el código de vinculación
        cy.get('[data-cy=codigo-container] input')
          .should('have.length', 4)
          .then(($inputs) => {
            const codigo = Array.from($inputs).map(input => input.value).join('')
            cy.wrap(codigo).as('codigoVinculacion')
            expect(codigo).to.have.length(4)
          })

        // Cerrar sesión
        cy.get('[data-cy=perfil-icon]').click()
        cy.get('[data-cy=logout]').click()

        // Login como alumno
        cy.get('[data-testid="email-input"]').type(testData.usuarioAlumno.mail)
        cy.get('[data-testid="password-input"]').type(password)
        cy.get('[data-testid="login-button"]').click()

        // Esperar a que la solicitud de inicio de sesión se complete
        cy.wait('@signIn').its('response.statusCode').should('eq', 200)

        // Después del login del alumno
        cy.visit('/cursos')
        cy.url().should('include', '/cursos')

        // Hacer clic en el botón de vincular
        cy.get('[data-cy=unirse-curso]').should('be.visible').click()

        // Ingresar el código de vinculación
        cy.get('@codigoVinculacion').then((codigo) => {
          cy.get('.cod-v-alumno-container')
            .find('.p-inputotp-input')
            .each(($input, index) => {
              cy.wrap($input).should('be.visible').type(codigo.charAt(index))
            })

          // Interceptar y verificar la vinculación
          cy.intercept('POST', '/api/curso/vincular-estudiante').as('vincularCurso')
          cy.get('[data-cy=btn-confirmar-vinculacion]').click()
          cy.wait('@vincularCurso', { timeout: 30000 })

          // Verificar mensaje de éxito
          cy.get('.p-toast-message-success')
            .should('be.visible')
            .and('contain', 'Vinculación exitosa')
        })
      })
    })
  })
})
