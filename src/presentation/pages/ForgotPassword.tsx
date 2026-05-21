import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ForgotPassword() {
  const [correo, setCorreo] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const email = correo.trim();
    if (!email) {
      setError('Ingresa tu correo electrónico');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/v1/conductores/forgot-password', {
        correo_electronico: email,
      });
      setSuccess(
        'Si el correo está registrado, recibirás instrucciones en breve.',
      );
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data) {
        const data = err.response.data as {
          errors?: string[];
          message?: string;
        };
        setError(
          (Array.isArray(data.errors) && data.errors.join(' ')) ||
            data.message ||
            'No pudimos procesar la solicitud',
        );
      } else {
        setError(
          'Error de red. Verifica que el backend esté en marcha y VITE_API_URL en .env.',
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='forgot-page'>
      <div className='forgot-card'>
        <img
          src='/Logo BusCali.jpg.jpg'
          alt='Logo BusCali'
          className='logo-top'
        />

        <h1>Recuperar Contraseña</h1>
        <p>Ingresa tu correo electrónico registrado como conductor</p>

        <form onSubmit={handleSubmit}>
          <input
            type='email'
            placeholder='Correo electrónico'
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            autoComplete='email'
          />

          {error && <p className='error'>{error}</p>}
          {success && <p className='success'>{success}</p>}

          <button type='submit' className='btn-primary' disabled={loading}>
            {loading ? 'Enviando…' : 'Enviar enlace'}
          </button>

          <button
            type='button'
            className='btn-secondary'
            onClick={() => navigate('/')}
          >
            Volver
          </button>
        </form>
      </div>
    </div>
  );
}
