import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_CONDUCTORES } from '../../infrastructure/axiosConfig';
import FieldError from '../Components/FieldError';
import { ROUTES } from '../routes';
import {
  validateLoginField,
  validateLoginForm,
  type AuthFieldErrors,
} from '../utils/authFormValidators';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [flash, setFlash] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<AuthFieldErrors>({});
  const [error, setError] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const msg = (location.state as { flash?: string } | null)?.flash;
    if (msg) {
      setFlash(msg);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const clearField = (key: keyof AuthFieldErrors) => {
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const local = validateLoginForm({ telefono, contrasena: password });
    if (Object.keys(local).length > 0) {
      setFieldErrors(local);
      return;
    }
    setFieldErrors({});
    setLoading(true);

    try {
      const response = await axios.post(API_CONDUCTORES.login, {
        telefono: telefono.replace(/\D/g, ''),
        contrasena: password,
      });

      if (response.status === 200) {
        const token =
          (response.data as { data?: { token?: string } })?.data?.token ??
          response.data?.token;
        const sessionValue = token ?? 'cookie-session';
        const storage = remember ? localStorage : sessionStorage;
        const other = remember ? sessionStorage : localStorage;
        other.removeItem('authToken');
        storage.setItem('authToken', sessionValue);
        navigate(ROUTES.conductores);
      } else {
        setError('Respuesta inválida del servidor');
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (!err.response) {
          setError(
            'No hay respuesta del servidor. Comprueba que el backend esté en marcha.',
          );
          return;
        }
        const status = err.response.status;
        const body = err.response.data as {
          message?: string;
          errors?: string[];
        };
        const detail =
          (Array.isArray(body?.errors) && body.errors.join(' ')) ||
          body?.message ||
          '';
        if (status === 401) {
          setError(detail || 'Teléfono o contraseña incorrectos');
        } else if (status === 400) {
          setError(detail || 'Datos inválidos');
        } else {
          setError(detail || `Error del servidor (${status})`);
        }
      } else {
        setError('Error inesperado. Inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  const inputInvalid = (key: keyof AuthFieldErrors) =>
    fieldErrors[key] ? 'input-invalid' : undefined;

  return (
    <>
      <div className='background-blur'></div>
      <div className='login-container'>
        <div className='login-card'>
          <img src='/Logo BusCali.jpg.jpg' alt='Logo BusCali' className='login-logo' />

          <form onSubmit={handleLogin} noValidate>
            <div
              className={`input-group${fieldErrors.telefono ? ' input-group-invalid' : ''}`}
            >
              <input
                type='tel'
                name='telefono'
                placeholder='Teléfono (solo números)'
                value={telefono}
                onChange={(e) => {
                  setTelefono(e.target.value.replace(/\D/g, ''));
                  clearField('telefono');
                  setError('');
                }}
                onBlur={() => {
                  const msg = validateLoginField('telefono', {
                    telefono,
                    contrasena: password,
                  });
                  setFieldErrors((prev) => {
                    const next = { ...prev };
                    if (msg) next.telefono = msg;
                    else delete next.telefono;
                    return next;
                  });
                }}
                className={inputInvalid('telefono')}
                aria-invalid={!!fieldErrors.telefono}
                aria-describedby={
                  fieldErrors.telefono ? 'err-login-telefono' : undefined
                }
                autoComplete='tel'
              />
              <FieldError id='err-login-telefono' message={fieldErrors.telefono} />
            </div>

            <div
              className={`input-group${fieldErrors.contrasena ? ' input-group-invalid' : ''}`}
            >
              <input
                type='password'
                name='contrasena'
                placeholder='Contraseña'
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearField('contrasena');
                  setError('');
                }}
                onBlur={() => {
                  const msg = validateLoginField('contrasena', {
                    telefono,
                    contrasena: password,
                  });
                  setFieldErrors((prev) => {
                    const next = { ...prev };
                    if (msg) next.contrasena = msg;
                    else delete next.contrasena;
                    return next;
                  });
                }}
                className={inputInvalid('contrasena')}
                aria-invalid={!!fieldErrors.contrasena}
                aria-describedby={
                  fieldErrors.contrasena ? 'err-login-pass' : undefined
                }
                autoComplete='current-password'
              />
              <FieldError id='err-login-pass' message={fieldErrors.contrasena} />
            </div>

            {flash && <p className='success'>{flash}</p>}
            {error && <p className='error'>{error}</p>}

            <div className='options'>
              <label>
                <input
                  type='checkbox'
                  checked={remember}
                  onChange={() => setRemember(!remember)}
                />
                Recordarme
              </label>
              <span
                className='forgot'
                onClick={() => navigate(ROUTES.recuperarContrasena)}
              >
                ¿Olvidaste tu contraseña?
              </span>
            </div>

            <button type='submit' className='login-btn' disabled={loading}>
              {loading ? 'Entrando…' : 'Iniciar Sesión'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
