import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import FieldError from '../Components/FieldError';
import { ROUTES } from '../routes';
import {
  normalizeResetToken,
  validateNewPasswordPair,
  validateResetToken,
  type AuthFieldErrors,
} from '../utils/authFormValidators';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [tokenInput, setTokenInput] = useState('');
  const [tokenValid, setTokenValid] = useState(false);
  const [validatingToken, setValidatingToken] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [fieldErrors, setFieldErrors] = useState<AuthFieldErrors>({});
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fromUrl = searchParams.get('token');
    if (fromUrl) {
      const normalized = normalizeResetToken(fromUrl);
      setTokenInput(normalized);
      void validateTokenRemote(normalized, false);
    }
  }, [searchParams]);

  const validateTokenRemote = async (token: string, showInfoOnSuccess = true) => {
    setError('');
    setInfo('');
    setTokenValid(false);
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next.token;
      return next;
    });

    const formatMsg = validateResetToken(token);
    if (formatMsg) {
      setFieldErrors((prev) => ({ ...prev, token: formatMsg }));
      return;
    }

    const code = normalizeResetToken(token);
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

    const token = normalizeResetToken(tokenInput);
    if (!tokenValid) {
      setError('Primero valida el código del correo.');
      return;
    }

    const pwdErrors = validateNewPasswordPair(password, confirm);
    if (Object.keys(pwdErrors).length > 0) {
      setFieldErrors(pwdErrors);
      return;
    }
    setFieldErrors({});

    setLoading(true);
    try {
      await axios.post('/api/v1/conductores/reset-password', {
        token,
        nueva_contrasena: password,
      });
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('authToken');
      navigate(ROUTES.login, {
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

  const inputInvalid = (key: keyof AuthFieldErrors) =>
    fieldErrors[key] ? 'input-invalid' : undefined;

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

        <form onSubmit={handleSubmit} noValidate>
          <label className='field-label' htmlFor='reset-token'>
            Código de verificación
          </label>
          <input
            id='reset-token'
            type='text'
            placeholder='32 caracteres del enlace del correo'
            value={tokenInput}
            onChange={(e) => {
              setTokenInput(e.target.value);
              setTokenValid(false);
              setFieldErrors((prev) => {
                const next = { ...prev };
                delete next.token;
                return next;
              });
            }}
            onBlur={() => {
              const msg = validateResetToken(tokenInput);
              setFieldErrors((prev) => {
                const next = { ...prev };
                if (msg) next.token = msg;
                else delete next.token;
                return next;
              });
            }}
            className={inputInvalid('token')}
            aria-invalid={!!fieldErrors.token}
            autoComplete='off'
            spellCheck={false}
          />
          <FieldError id='err-reset-token' message={fieldErrors.token} />

          <button
            type='button'
            className='btn-secondary'
            disabled={validatingToken || !tokenInput.trim()}
            onClick={() => validateTokenRemote(tokenInput)}
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
                placeholder='Ej. MiClave1!'
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setFieldErrors((prev) => {
                    const next = { ...prev };
                    delete next.contrasena;
                    delete next.confirmar;
                    return next;
                  });
                }}
                onBlur={() => {
                  const errs = validateNewPasswordPair(password, confirm);
                  setFieldErrors((prev) => ({
                    ...prev,
                    contrasena: errs.contrasena,
                    confirmar: errs.confirmar,
                  }));
                }}
                className={inputInvalid('contrasena')}
                autoComplete='new-password'
              />
              <FieldError
                id='err-reset-pass'
                message={fieldErrors.contrasena}
              />

              <label className='field-label' htmlFor='confirm-password'>
                Confirmar contraseña
              </label>
              <input
                id='confirm-password'
                type='password'
                placeholder='Repite la contraseña'
                value={confirm}
                onChange={(e) => {
                  setConfirm(e.target.value);
                  setFieldErrors((prev) => {
                    const next = { ...prev };
                    delete next.confirmar;
                    return next;
                  });
                }}
                onBlur={() => {
                  const errs = validateNewPasswordPair(password, confirm);
                  setFieldErrors((prev) => ({
                    ...prev,
                    confirmar: errs.confirmar,
                  }));
                }}
                className={inputInvalid('confirmar')}
                autoComplete='new-password'
              />
              <FieldError
                id='err-reset-confirm'
                message={fieldErrors.confirmar}
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
            onClick={() => navigate(ROUTES.recuperarContrasena)}
          >
            Solicitar nuevo enlace
          </button>
        </form>
      </div>
    </div>
  );
}
