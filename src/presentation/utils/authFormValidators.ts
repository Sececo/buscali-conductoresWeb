import { EMAIL_RE, PASSWORD_RE, PHONE_RE, RESET_TOKEN_RE } from './validationRules';

export type LoginField = 'telefono' | 'contrasena';
export type ForgotField = 'correo';
export type ResetField = 'token' | 'contrasena' | 'confirmar';

export type AuthFieldErrors = Partial<
  Record<LoginField | ForgotField | ResetField | 'general', string>
>;

export function validateLoginForm(form: {
  telefono: string;
  contrasena: string;
}): AuthFieldErrors {
  const err: AuthFieldErrors = {};
  const tel = form.telefono.replace(/\D/g, '');

  if (!tel) {
    err.telefono = 'El teléfono es obligatorio.';
  } else if (!PHONE_RE.test(tel)) {
    err.telefono =
      'Ingresa un teléfono válido (solo números, entre 7 y 15 dígitos).';
  }

  if (!form.contrasena) {
    err.contrasena = 'La contraseña es obligatoria.';
  }

  return err;
}

export function validateLoginField(
  field: LoginField,
  form: { telefono: string; contrasena: string },
): string | undefined {
  return validateLoginForm(form)[field];
}

export function validateForgotEmail(correo: string): string | undefined {
  const email = correo.trim();
  if (!email) return 'El correo electrónico es obligatorio.';
  if (!EMAIL_RE.test(email)) return 'Ingresa un correo electrónico válido.';
  return undefined;
}

export function normalizeResetToken(raw: string): string {
  return raw.trim().replace(/\s/g, '');
}

export function validateResetToken(token: string): string | undefined {
  const code = normalizeResetToken(token);
  if (!code) return 'Pega el código del enlace o ábrelo desde el correo.';
  if (!RESET_TOKEN_RE.test(code)) {
    return 'El código debe tener 32 caracteres (después de token= en el enlace).';
  }
  return undefined;
}

export function validateNewPasswordPair(
  password: string,
  confirm: string,
): AuthFieldErrors {
  const err: AuthFieldErrors = {};

  if (!password) {
    err.contrasena = 'La nueva contraseña es obligatoria.';
  } else if (!PASSWORD_RE.test(password)) {
    err.contrasena =
      'Entre 8 y 50 caracteres, con mayúscula, minúscula, número y símbolo (@$!%*?&).';
  }

  if (!confirm) {
    err.confirmar = 'Confirma la contraseña.';
  } else if (password && confirm !== password) {
    err.confirmar = 'Las contraseñas no coinciden.';
  }

  return err;
}
