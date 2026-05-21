import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const PASSWORD_RULE =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,50}$/;
const TOKEN_RULE = /^[A-Za-z0-9]{32}$/;

function normalizeToken(raw: string): string {
  return raw.trim().replace(/\s/g, '');
}

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [tokenInput, setTokenInput] = useState('');
  const [tokenValid, setTokenValid] = useState(false);
  const [validatingToken, setValidatingToken] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fromUrl = searchParams.get('token');
    if (fromUrl) {
      const normalized = normalizeToken(fromUrl);
      setTokenInput(normalized);
      void validateToken(normalized, false);
    }
  }, [searchParams]);

  const validateToken = async (token: string, showInfoOnSuccess = true) => {
    setError('');
    setInfo('');
    setTokenValid(false);

    const code = normalizeToken(token);
    if (!code) {
      setError('Pega el código que viene en el correo o abre el enlace completo.');
      return;
    }
    if (!TOKEN_RULE.test(code)) {
      setError('El código debe tener 32 caracteres (el que aparece después de token= en el enlace).');
      return;
    }

    setValidatingToken(true);
    try {
      await axios.get(
        `/api/v1/conductores/reset-password/validate/${encodeURIComponent(code)}`,
      );
      setTokenValid(true);
      if (showInfoOnSuccess) {
        setInfo('Código válido. Define tu nueva contraseña.');
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data) {
        const data = err.response.data as {
          errors?: string[];
          message?: string;
        };
        setError(
          (Array.isArray(data.errors) && data.errors.join(' ')) ||
            data.message ||
            'Código no válido',
        );
      } else {
        setError('Error de red. Verifica que el backend esté en marcha.');
      }
    } finally {
      setValidatingToken(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');

    const token = normalizeToken(tokenInput);
    if (!tokenValid) {
      setError('Primero valida el código del correo.');
      return;
    }
    if (!password || !confirm) {
      setError('Completa ambos campos de contraseña');
      return;
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (!PASSWORD_RULE.test(password)) {
      setError(
        'La contraseña debe tener 8-50 caracteres, mayúscula, minúscula, número y símbolo (@$!%*?&).',
      );
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/v1/conductores/reset-password', {
        token,
        nueva_contrasena: password,
      });
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('authToken');
      navigate('/', {
        replace: true,
        state: {
          flash: 'Contraseña actualizada. Inicia sesión con tu nueva clave.',
        },
      });
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data) {
        const data = err.response.data as {
          errors?: string[];
          message?: string;
        };
        setError(
          (Array.isArray(data.errors) && data.errors.join(' ')) ||
            data.message ||
            'No pudimos restablecer la contraseña',
        );
      } else {
        setError('Error de red. Verifica que el backend esté en marcha.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='forgot-page'>
      <div className='forgot-card forgot-card-wide'>
        <img
          src='/Logo BusCali.jpg.jpg'
          alt='Logo BusCali'
          className='logo-top'
        />

        <h1>Nueva contraseña</h1>
        <p>Paso 1: código del correo · Paso 2: nueva clave (válida 15 min)</p>

        <form onSubmit={handleSubmit}>
          <label className='field-label' htmlFor='reset-token'>
            Código de verificación
          </label>
          <input
            id='reset-token'
            type='text'
            placeholder='Pega el código del enlace (32 caracteres)'
            value={tokenInput}
            onChange={(e) => {
              setTokenInput(e.target.value);
              setTokenValid(false);
            }}
            autoComplete='off'
            spellCheck={false}
          />

          <button
            type='button'
            className='btn-secondary'
            disabled={validatingToken || !tokenInput.trim()}
            onClick={() => validateToken(tokenInput)}
          >
            {validatingToken ? 'Validando…' : 'Validar código'}
          </button>

          {tokenValid && (
            <>
              <label className='field-label' htmlFor='new-password'>
                Nueva contraseña
              </label>
              <input
                id='new-password'
                type='password'
                placeholder='Nueva contraseña'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete='new-password'
              />
              <input
                type='password'
                placeholder='Confirmar contraseña'
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete='new-password'
              />
            </>
          )}

          {error && <p className='error'>{error}</p>}
          {info && <p className='success'>{info}</p>}

          {tokenValid && (
            <button type='submit' className='btn-primary' disabled={loading}>
              {loading ? 'Guardando…' : 'Guardar y volver al login'}
            </button>
          )}

          <button
            type='button'
            className='btn-secondary'
            onClick={() => navigate('/forgot-password')}
          >
            Solicitar nuevo enlace
          </button>
        </form>
      </div>
    </div>
  );
}
