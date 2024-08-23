import { Button, Form, Modal } from 'react-bootstrap'; 

function Actividad({ show, handleClose }) {
  return (
    <>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton style={{ backgroundColor: '#7fa7db', color: '#1A2035', fontWeight: 'bold' }}>
          <Modal.Title>Crear instancia evaluativa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
          <Form.Group className="mb-3" controlId="grupoInstancia">
            <Form.Label>Nombre de la instancia</Form.Label>
            <Form.Control type="text" placeholder="Escriba un nombre" />
          </Form.Group>

            <Form.Group className="mb-3" controlId="grupoMateria">
              <Form.Label>Porcentaje de ponderacion</Form.Label>
              <Form.Select aria-label="Floating label select example">
                <option>Seleccione el porcentaje</option>
                <option value="1">25%</option>
                <option value="2">50%</option>
                <option value="3">75%</option>
                <option value="3">100%</option>
              </Form.Select>

              <Form.Label>Tipo de instancia</Form.Label>
              <Form.Select aria-label="Floating label select example">
                <option>Seleccione el tipo</option>
                <option value="1">Trabajo practico</option>
                <option value="2">Informe</option>
                <option value="3">Parcial</option>
                <option value="3">Final</option>
              </Form.Select>

              <Form.Group className="mb-3" controlId="grupoInstancia">
                <Form.Label>Descripcion (opcional)</Form.Label>
                <Form.Control type="text" placeholder="Escriba una descripcion" />
              </Form.Group>
            </Form.Group>

          </Form>
        </Modal.Body>
        <Modal.Footer>
          <div className="d-flex justify-content-between w-100">
            <Button variant="secondary" onClick={handleClose} 
              style={{ 
                backgroundColor: '#CCDCF1', 
                color: '#1A2035', 
                fontWeight: 'bold', 
                borderBlockColor: '#1A2035',
                }}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleClose} style={{ backgroundColor: '#1A2035' }}>
              Confirmar
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default Actividad;