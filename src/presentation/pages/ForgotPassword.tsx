import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import FieldError from '../Components/FieldError';
import { ROUTES } from '../routes';
import { validateForgotEmail } from '../utils/authFormValidators';

export default function ForgotPassword() {
  const [correo, setCorreo] = useState('');
  const [correoError, setCorreoError] = useState<string | undefined>();
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

    const emailMsg = validateForgotEmail(correo);
    if (emailMsg) {
      setCorreoError(emailMsg);
      return;
    }
    setCorreoError(undefined);
    const email = correo.trim();

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

        <h1>Recuperar contraseña</h1>
        <p>Ingresa tu correo registrado como conductor</p>

        <form onSubmit={handleSubmit} noValidate>
          <label className='field-label' htmlFor='forgot-email'>
            Correo electrónico
          </label>
          <input
            id='forgot-email'
            type='email'
            placeholder='nombre@ejemplo.com'
            value={correo}
            onChange={(e) => {
              setCorreo(e.target.value);
              setCorreoError(undefined);
              setError('');
            }}
            onBlur={() => setCorreoError(validateForgotEmail(correo))}
            className={correoError ? 'input-invalid' : undefined}
            aria-invalid={!!correoError}
            aria-describedby={correoError ? 'err-forgot-email' : undefined}
            autoComplete='email'
          />
          <FieldError id='err-forgot-email' message={correoError} />

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
            onClick={() => navigate(ROUTES.login)}
          >
            Volver
          </button>
        </form>
      </div>
    </div>
  );
}
