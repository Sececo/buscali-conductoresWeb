import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ForgotPassword() {
  const [correo, setCorreo] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [recoveryLink, setRecoveryLink] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setRecoveryLink('');

    const email = correo.trim();
    if (!email) {
      setError('Ingresa tu correo electrónico');
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post<{
        message?: string;
        data?: { hint?: string; recoveryLink?: string };
      }>('/api/v1/conductores/forgot-password', {
        correo_electronico: email,
      });
      const hint = data?.data?.hint ?? data?.message;
      const link = data?.data?.recoveryLink;
      setSuccess(
        hint ||
          'Si el correo está registrado, recibirás instrucciones en breve.',
      );
      if (link) setRecoveryLink(link);
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
          {recoveryLink && (
            <p className='recovery-link'>
              <span>Enlace directo (desarrollo):</span>
              <a href={recoveryLink} target='_blank' rel='noreferrer'>
                Abrir para cambiar contraseña
              </a>
            </p>
          )}

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
