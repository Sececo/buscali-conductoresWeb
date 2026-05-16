/** Campos del formulario de registro (alineados con CreateConductorDTO). */
export type RegisterField =
  | 'cedula'
  | 'nombre'
  | 'correo_electronico'
  | 'telefono'
  | 'contrasena';

const CEDULA_RE = /^[0-9]{1,20}$/;
const NOMBRE_CHARS_RE = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
const PHONE_RE = /^\+?[0-9]{7,15}$/;
/** Aproximación razonable a IsEmail; el backend valida el formato definitivo. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
const PASSWORD_RE =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,50}$/;

export type FieldErrors = Partial<Record<RegisterField | 'general', string>>;

function uniqueJoined(messages: string[]): string {
  return [...new Set(messages.map((m) => m.trim()).filter(Boolean))].join(' ');
}

/** Asigna cada mensaje del backend al campo más probable (mensajes en español del DTO). */
export function mapBackendErrorsToFields(errors: string[]): FieldErrors {
  const buckets: Partial<Record<RegisterField | 'general', string[]>> = {};

  const push = (key: RegisterField | 'general', msg: string) => {
    const t = msg.trim();
    if (!t) return;
    if (!buckets[key]) buckets[key] = [];
    buckets[key]!.push(t);
  };

  for (const raw of errors) {
    const msg = raw.trim();
    if (!msg) continue;
    const lower = msg.toLowerCase();

    if (lower.includes('contraseña')) {
      push('contrasena', msg);
    } else if (lower.includes('cédula') || lower.includes('cedula')) {
      push('cedula', msg);
    } else if (lower.includes('teléfono') || lower.includes('telefono')) {
      push('telefono', msg);
    } else if (lower.includes('correo')) {
      push('correo_electronico', msg);
    } else if (lower.includes('nombre')) {
      push('nombre', msg);
    } else {
      push('general', msg);
    }
  }

  const out: FieldErrors = {};
  for (const key of Object.keys(buckets) as (RegisterField | 'general')[]) {
    const list = buckets[key];
    if (list?.length) {
      out[key] = uniqueJoined(list);
    }
  }
  return out;
}

/** Validación local alineada con `CreateConductorDTO` (antes de enviar al API). */
export function validateRegisterForm(form: {
  cedula: string;
  nombre: string;
  correo_electronico: string;
  telefono: string;
  contrasena: string;
}): FieldErrors {
  const err: FieldErrors = {};

  const cedulaDigits = form.cedula.replace(/\D/g, '');
  if (!cedulaDigits) {
    err.cedula = 'La cédula es obligatoria.';
  } else if (!CEDULA_RE.test(cedulaDigits)) {
    err.cedula = 'La cédula solo puede contener números (hasta 20 dígitos).';
  }

  const nombre = form.nombre.trim();
  if (!nombre) {
    err.nombre = 'El nombre es obligatorio.';
  } else if (!/\S/.test(nombre)) {
    err.nombre = 'El nombre no puede ser solo espacios.';
  } else if (!NOMBRE_CHARS_RE.test(nombre)) {
    err.nombre = 'El nombre solo puede incluir letras y espacios.';
  }

  const correo = form.correo_electronico.trim();
  if (!correo) {
    err.correo_electronico = 'El correo es obligatorio.';
  } else if (!EMAIL_RE.test(correo)) {
    err.correo_electronico = 'Ingresa un correo electrónico válido.';
  }

  const telDigits = form.telefono.replace(/\D/g, '');
  if (!telDigits) {
    err.telefono = 'El teléfono es obligatorio.';
  } else if (!PHONE_RE.test(telDigits)) {
    err.telefono =
      'El teléfono solo puede incluir números (entre 7 y 15 dígitos). Puedes anteponer +.';
  }

  if (!form.contrasena) {
    err.contrasena = 'La contraseña es obligatoria.';
  } else if (!PASSWORD_RE.test(form.contrasena)) {
    err.contrasena =
      'La contraseña debe tener entre 8 y 50 caracteres e incluir mayúscula, minúscula, número y un símbolo (@, $, !, %, *, ?, &).';
  }

  return err;
}

/** Validación para edición: solo valida formato cuando hay contenido (campos opcionales en el DTO). */
export function validateEditForm(form: {
  nombre: string;
  correo_electronico: string;
  telefono: string;
}): FieldErrors {
  const err: FieldErrors = {};

  const nombre = form.nombre.trim();
  if (nombre) {
    if (!/\S/.test(nombre)) {
      err.nombre = 'El nombre no puede ser solo espacios.';
    } else if (!NOMBRE_CHARS_RE.test(nombre)) {
      err.nombre = 'El nombre solo puede incluir letras y espacios.';
    }
  }

  const correo = form.correo_electronico.trim();
  if (correo && !EMAIL_RE.test(correo)) {
    err.correo_electronico = 'Ingresa un correo electrónico válido.';
  }

  const telDigits = form.telefono.replace(/\D/g, '');
  if (telDigits && !PHONE_RE.test(telDigits)) {
    err.telefono =
      'El teléfono solo puede incluir números (entre 7 y 15 dígitos). Puedes anteponer +.';
  }

  return err;
}

/** Valida un solo campo en modo registro (al salir del input o al escribir). */
export function validateRegisterField(
  field: RegisterField,
  form: Parameters<typeof validateRegisterForm>[0],
): string | undefined {
  const all = validateRegisterForm(form);
  return all[field];
}
