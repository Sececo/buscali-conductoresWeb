/** Reglas compartidas con el backend (CreateConductorDTO / ResetPasswordDTO). */
export const CEDULA_RE = /^[0-9]{1,20}$/;
export const NOMBRE_CHARS_RE = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
export const PHONE_RE = /^\+?[0-9]{7,15}$/;
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
export const PASSWORD_RE =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,50}$/;
export const RESET_TOKEN_RE = /^[A-Za-z0-9]{32}$/;
