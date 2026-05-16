import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ConductorApiRepository,
  ApiValidationError,
} from '../../infrastructure/ConductorApiRepository';
import { RegisterConductor } from '../../application/useCases/RegisterConductor';
import { UpdateConductor } from '../../application/useCases/UpdateConductor';
import type { Conductor } from '../../domain/entities/Conductor';
import {
  mapBackendErrorsToFields,
  validateRegisterForm,
  validateEditForm,
  validateRegisterField,
  type FieldErrors,
  type RegisterField,
} from '../utils/conductorFormValidators';

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className='register-field-error' role='alert'>
      {message}
    </p>
  );
}

export default function RegistrarConductor() {
  const location = useLocation();
  const conductorToEdit = location.state as Conductor | undefined;

  const navigate = useNavigate();
  const repository = useMemo(() => new ConductorApiRepository(), []);

  const [form, setForm] = useState({
    cedula: conductorToEdit?.cedula || '',
    nombre: conductorToEdit?.nombre || '',
    telefono: conductorToEdit?.telefono || '',
    correo_electronico: conductorToEdit?.correo_electronico || '',
    contrasena: conductorToEdit?.contrasena || '',
    estado:
      conductorToEdit?.estado === 'Inactivo' ? 'Inactivo' : 'Activo',
  });

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const clearField = useCallback((key: keyof FieldErrors) => {
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  useEffect(() => {
    setFieldErrors({});
    if (conductorToEdit) {
      setForm({
        cedula: conductorToEdit.cedula,
        nombre: conductorToEdit.nombre || '',
        telefono: conductorToEdit.telefono || '',
        correo_electronico: conductorToEdit.correo_electronico || '',
        contrasena: '',
        estado:
          conductorToEdit.estado === 'Inactivo' ? 'Inactivo' : 'Activo',
      });
    } else {
      setForm({
        cedula: '',
        nombre: '',
        telefono: '',
        correo_electronico: '',
        contrasena: '',
        estado: 'Activo',
      });
    }
  }, [conductorToEdit]);

  const registerFormPayload = useMemo(
    () => ({
      cedula: form.cedula,
      nombre: form.nombre,
      correo_electronico: form.correo_electronico,
      telefono: form.telefono,
      contrasena: form.contrasena,
    }),
    [
      form.cedula,
      form.nombre,
      form.correo_electronico,
      form.telefono,
      form.contrasena,
    ],
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name;
    setForm({ ...form, [name]: e.target.value });
    clearField('general');
    if (
      name === 'cedula' ||
      name === 'nombre' ||
      name === 'correo_electronico' ||
      name === 'contrasena'
    ) {
      clearField(name as keyof FieldErrors);
    }
  };

  const handleRegisterBlur = (field: RegisterField) => {
    const msg = validateRegisterField(field, registerFormPayload);
    setFieldErrors((prev) => {
      const next = { ...prev };
      if (msg) next[field] = msg;
      else delete next[field];
      return next;
    });
  };

  const handleEditBlur = (
    field: 'nombre' | 'correo_electronico' | 'telefono',
  ) => {
    const all = validateEditForm({
      nombre: form.nombre,
      correo_electronico: form.correo_electronico,
      telefono: form.telefono,
    });
    setFieldErrors((prev) => {
      const next = { ...prev };
      const msg = all[field];
      if (msg) next[field] = msg;
      else delete next[field];
      return next;
    });
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setFieldErrors({});

    try {
      if (conductorToEdit) {
        const local = validateEditForm({
          nombre: form.nombre,
          correo_electronico: form.correo_electronico,
          telefono: form.telefono,
        });
        if (Object.keys(local).length > 0) {
          setFieldErrors(local);
          return;
        }

        const updatedConductor: Conductor = {
          cedula: conductorToEdit.cedula,
          nombre: form.nombre.trim() || conductorToEdit.nombre,
          correo_electronico:
            form.correo_electronico.trim() || conductorToEdit.correo_electronico,
          telefono:
            form.telefono.replace(/\D/g, '') ||
            conductorToEdit.telefono.replace(/\D/g, ''),
          estado: form.estado === 'Inactivo' ? 'Inactivo' : 'Activo',
        };
        await UpdateConductor(repository, updatedConductor);
        navigate('/conductores');
      } else {
        const local = validateRegisterForm(registerFormPayload);
        if (Object.keys(local).length > 0) {
          setFieldErrors(local);
          return;
        }

        const newConductor: Conductor = {
          cedula: form.cedula.replace(/\D/g, ''),
          nombre: form.nombre.trim(),
          correo_electronico: form.correo_electronico.trim(),
          telefono: form.telefono.replace(/\D/g, ''),
          contrasena: form.contrasena,
          estado: form.estado === 'Inactivo' ? 'Inactivo' : 'Activo',
        };
        await RegisterConductor(repository, newConductor);
        navigate('/conductores');
      }
    } catch (error) {
      console.error('Error:', error);
      if (error instanceof ApiValidationError) {
        setFieldErrors(mapBackendErrorsToFields(error.errors));
        return;
      }
      setFieldErrors({
        general:
          error instanceof Error
            ? error.message
            : 'Error al procesar la solicitud',
      });
    }
  };

  const inputClass = (hasError: boolean) =>
    hasError ? 'register-input-invalid' : undefined;

  return (
    <div className='register-page'>
      <div className='register-container'>
        <div className='register-left'>
          <img src='/Torre-de-Cali.jpg' alt='Driver' />
        </div>

        <div className='register-right'>
          <form className='register-right-form' onSubmit={handleSubmit}>
            <div className='register-form-body'>
              <h1>{conductorToEdit ? 'Editar Conductor' : 'Registro'}</h1>

              <FieldError id='err-general' message={fieldErrors.general} />

              {conductorToEdit && (
                <p className='register-cedula-hint'>
                  <strong>Cédula:</strong> {conductorToEdit.cedula}
                </p>
              )}

              {!conductorToEdit && (
                <>
                  <strong>Cédula</strong>
                  <input
                    name='cedula'
                    placeholder='1234567890'
                    value={form.cedula}
                    onChange={handleChange}
                    onBlur={() => handleRegisterBlur('cedula')}
                    className={inputClass(!!fieldErrors.cedula)}
                    aria-invalid={!!fieldErrors.cedula}
                    aria-describedby={
                      fieldErrors.cedula ? 'err-cedula' : undefined
                    }
                  />
                  <FieldError id='err-cedula' message={fieldErrors.cedula} />
                </>
              )}

              <strong>Nombre</strong>
              <input
                name='nombre'
                placeholder='Sebastian Manrique'
                value={form.nombre}
                onChange={handleChange}
                onBlur={() =>
                  conductorToEdit
                    ? handleEditBlur('nombre')
                    : handleRegisterBlur('nombre')
                }
                className={inputClass(!!fieldErrors.nombre)}
                aria-invalid={!!fieldErrors.nombre}
                aria-describedby={
                  fieldErrors.nombre ? 'err-nombre' : undefined
                }
              />
              <FieldError id='err-nombre' message={fieldErrors.nombre} />

              <strong>Correo Electronico</strong>
              <input
                name='correo_electronico'
                placeholder='usuarioexample.@gmail.com'
                value={form.correo_electronico}
                onChange={handleChange}
                onBlur={() =>
                  conductorToEdit
                    ? handleEditBlur('correo_electronico')
                    : handleRegisterBlur('correo_electronico')
                }
                className={inputClass(!!fieldErrors.correo_electronico)}
                aria-invalid={!!fieldErrors.correo_electronico}
                aria-describedby={
                  fieldErrors.correo_electronico
                    ? 'err-correo'
                    : undefined
                }
              />
              <FieldError
                id='err-correo'
                message={fieldErrors.correo_electronico}
              />

              <strong>Teléfono</strong>
              <input
                name='telefono'
                placeholder='3105106574'
                value={form.telefono}
                onChange={(e) => {
                  setForm((f) => ({
                    ...f,
                    telefono: e.target.value.replace(/\D/g, ''),
                  }));
                  clearField('telefono');
                  clearField('general');
                }}
                onBlur={() =>
                  conductorToEdit
                    ? handleEditBlur('telefono')
                    : handleRegisterBlur('telefono')
                }
                className={inputClass(!!fieldErrors.telefono)}
                aria-invalid={!!fieldErrors.telefono}
                aria-describedby={
                  fieldErrors.telefono ? 'err-telefono' : undefined
                }
              />
              <FieldError id='err-telefono' message={fieldErrors.telefono} />

              {!conductorToEdit && (
                <>
                  <strong>Contraseña</strong>
                  <input
                    name='contrasena'
                    placeholder='Abc@0123'
                    value={form.contrasena}
                    onChange={handleChange}
                    onBlur={() => handleRegisterBlur('contrasena')}
                    className={inputClass(!!fieldErrors.contrasena)}
                    aria-invalid={!!fieldErrors.contrasena}
                    aria-describedby={
                      fieldErrors.contrasena ? 'err-contrasena' : undefined
                    }
                  />
                  <FieldError
                    id='err-contrasena'
                    message={fieldErrors.contrasena}
                  />
                </>
              )}

              <strong>Estado</strong>
              <select
                className='register-estado-select'
                name='estado'
                value={form.estado}
                onChange={(e) =>
                  setForm((f) => ({ ...f, estado: e.target.value }))
                }
              >
                <option value='Activo'>Activo</option>
                <option value='Inactivo'>Inactivo</option>
              </select>
            </div>

            <div className='register-actions'>
              <button
                type='button'
                onClick={() => navigate('/conductores')}
                className='btn-volver'
              >
                ← Volver
              </button>
              <button type='submit' className='btn-registrar-editar'>
                {conductorToEdit ? 'Actualizar' : 'Registrar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
