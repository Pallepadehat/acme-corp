import type { Translation } from './en.ts'

export const da: Translation = {
  app: {
    name: 'Acme Corp',
  },
  auth: {
    signInTitle: 'Log ind',
    signUpTitle: 'Opret en konto',
    name: 'Navn',
    email: 'E-mail',
    password: 'Adgangskode',
    signIn: 'Log ind',
    signUp: 'Opret konto',
    switchToSignUp: 'Ingen konto endnu? Opret en',
    switchToSignIn: 'Har du allerede en konto? Log ind',
    signOut: 'Log ud',
    failed: 'Det virkede ikke. Tjek dine oplysninger og prøv igen.',
  },
  todos: {
    title: 'Opgaver',
    placeholder: 'Hvad skal gøres?',
    add: 'Tilføj',
    empty: 'Intet at lave. Nyd det.',
    delete: 'Slet',
    remaining_one: '{{count}} tilbage',
    remaining_other: '{{count}} tilbage',
  },
  settings: {
    theme: 'Tema',
    light: 'Lyst',
    dark: 'Mørkt',
    system: 'System',
    language: 'Sprog',
  },
  errors: {
    generic: 'Noget gik galt.',
  },
}
