import { Button, Form, Modal } from 'react-bootstrap'; 

function Curso({ show, handleClose }) {
  return (
    <>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton style={{ backgroundColor: '#7fa7db', color: '#1A2035', fontWeight: 'bold' }}>
          <Modal.Title>Agregar curso</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="grupoComision">
              <Form.Label>Comisión</Form.Label>
              <Form.Select aria-label="Floating label select example">
                <option>Elige la comisión</option>
                <option value="1">S51</option>
                <option value="2">S41</option>
                <option value="3">S32</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3" controlId="grupoMateria">
              <Form.Label>Materia</Form.Label>
              <Form.Select aria-label="Floating label select example">
                <option>Seleccione la materia</option>
                <option value="1">Proyecto final</option>
                <option value="2">Sistemas de gestión</option>
                <option value="3">Inteligencia artificial</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3" controlId="grupoCiclo">
              <Form.Label>Ciclo lectivo</Form.Label>
              <Form.Control
                type="text"
                placeholder="2024"
              />
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

export default Curso;