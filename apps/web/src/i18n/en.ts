// The English catalogue is the schema: every other language must have exactly these keys.
export const en = {
  app: {
    name: 'Acme Corp',
  },
  auth: {
    signInTitle: 'Sign in',
    signUpTitle: 'Create an account',
    name: 'Name',
    email: 'Email',
    password: 'Password',
    signIn: 'Sign in',
    signUp: 'Create account',
    switchToSignUp: 'No account yet? Create one',
    switchToSignIn: 'Already have an account? Sign in',
    signOut: 'Sign out',
    failed: 'That did not work. Check your details and try again.',
  },
  todos: {
    title: 'Todos',
    placeholder: 'What needs doing?',
    add: 'Add',
    empty: 'Nothing to do. Enjoy it.',
    delete: 'Delete',
    remaining_one: '{{count}} left',
    remaining_other: '{{count}} left',
  },
  settings: {
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
    system: 'System',
    language: 'Language',
  },
  errors: {
    generic: 'Something went wrong.',
  },
} as const

type Widen<T> = { [K in keyof T]: T[K] extends string ? string : Widen<T[K]> }
export type Translation = Widen<typeof en>
