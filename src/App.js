import React, { useState, useEffect } from 'react';
import { Button, TextField, TextareaAutosize, Card, CardContent, CardActions, CardHeader, Typography, Modal } from '@mui/material';
import axios from 'axios';
import './App.css';

const timeAgo = (date) => {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  let interval = Math.floor(seconds / 31536000);
  if (interval > 1) return `${interval} años`;
  interval = Math.floor(seconds / 2592000);
  if (interval > 1) return `${interval} meses`;
  interval = Math.floor(seconds / 86400);
  if (interval > 1) return `${interval} días`;
  interval = Math.floor(seconds / 3600);
  if (interval > 1) return `${interval} horas`;
  interval = Math.floor(seconds / 60);
  if (interval > 1) return `${interval} minutos`;
  return 'ahora';
};

function App() {
  const [jobs, setJobs] = useState([]);
  const [offerAmount, setOfferAmount] = useState('');
  const [offerDescription, setOfferDescription] = useState('');
  const [filterSkill, setFilterSkill] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, []);
  
  const fetchJobs = async () => {
    try {
      const response = await axios.get('/api/jobs');
      console.log('API response:', response.data);
      setJobs(response.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setJobs([]);
    }
  };



  const handleSubmitOffer = async (jobId) => {
    try {
      await axios.post('/api/apply', {
        jobId,
        amount: offerAmount,
        description: offerDescription,
      });
      console.log('Application submitted successfully');
      handleCloseModal();
    } catch (error) {
      console.error('Error submitting application:', error);
    }
  };

  const filteredJobs = jobs.filter(job =>
    job.skills && Array.isArray(job.skills) && job.skills.some(skill => 
      skill.toLowerCase().includes(filterSkill.toLowerCase())
    )
  );

  const handleOpenModal = (job) => {
    setSelectedJob(job);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedJob(null);
    setOfferAmount('');
    setOfferDescription('');
  };

  return (
    <div className="container">
      <Typography variant="h4" gutterBottom>
        Trabajos Publicados
      </Typography>

      <TextField
        placeholder="Buscar por habilidades"
        value={filterSkill}
        onChange={(e) => setFilterSkill(e.target.value)}
        fullWidth
        style={{ marginBottom: '20px' }}
      />

      {filteredJobs.map((job) => (
        <Card key={job.id} className="card">
          <CardHeader title={job.title} subheader={`Costo estimado: $${job.cost} | Publicado ${timeAgo(job.posted_at)}`} />
          <CardContent>
            <Typography variant="body2">
              {job.description.substring(0, 300)}{job.description.length > 300 && '...'} 
              {job.description.length > 300 && (
                <span
                  onClick={() => handleOpenModal(job)}
                  style={{ color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Ver más
                </span>
              )}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Habilidades necesarias: {job.skills && Array.isArray(job.skills) ? job.skills.join(', ') : 'No especificadas'}
            </Typography>
          </CardContent>
          <CardActions>
            <Button variant="contained" onClick={() => handleOpenModal(job)}>
              Postularse
            </Button>
          </CardActions>
        </Card>
      ))}

      <Modal open={modalOpen} onClose={handleCloseModal}>
        <div className="modal">
          <button
            onClick={handleCloseModal}
            className="close-button"
          >
            X
          </button>

          {selectedJob && (
            <>
              <Typography variant="h6">{selectedJob.title}</Typography>
              <Typography variant="body2">{selectedJob.description}</Typography>
              <Typography variant="body2" color="textSecondary">
                Habilidades necesarias: {selectedJob.skills && Array.isArray(selectedJob.skills) ? selectedJob.skills.join(', ') : 'No especificadas'}
              </Typography>

              <form onSubmit={(e) => { e.preventDefault(); handleSubmitOffer(selectedJob.id); }} className="form">
                <TextField
                  type="number"
                  placeholder="Tu oferta ($)"
                  value={offerAmount}
                  onChange={(e) => setOfferAmount(e.target.value)}
                  required
                  fullWidth
                />
                <TextareaAutosize
                  minRows={3}
                  placeholder="Describe tu propuesta"
                  value={offerDescription}
                  onChange={(e) => setOfferDescription(e.target.value)}
                  required
                  className="textarea"
                />
                <Button type="submit" variant="contained">Enviar Oferta</Button>
              </form>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}

export default App;