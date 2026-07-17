// Client ID público de Google Sign-In. Se crea en console.cloud.google.com →
// Credentials → OAuth Client ID (Web) con los orígenes autorizados:
// https://calistenia.bio, https://www.calistenia.bio,
// https://calistenia-bio.pages.dev y http://localhost:4000.
// Mientras diga PENDIENTE, el botón de login no se muestra (deploy seguro).
export const GOOGLE_CLIENT_ID = "782647387527-9p6jlts7mn16fctb4151bt8euuj16vrj.apps.googleusercontent.com";

export interface AuthUser {
  email: string;
  name?: string;
  picture?: string;
}
