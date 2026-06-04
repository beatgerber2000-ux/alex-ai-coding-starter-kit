import next from 'eslint-config-next/core-web-vitals'

// Migriert von `next lint` (in Next 16 entfernt) auf die ESLint-9-Flat-Config.
// `eslint-config-next` 16 liefert eine native Flat-Config; Verhalten entspricht
// der bisherigen `.eslintrc.json` ("next/core-web-vitals").
const eslintConfig = [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'playwright-report/**',
      'test-results/**',
      'next-env.d.ts',
    ],
  },
  ...next,
  {
    // Vendored shadcn/ui-Komponenten werden nicht selbst gewartet (Copy-Paste aus
    // shadcn). Die strenge Purity-Regel aus Next 16 würde hier Vendor-Code anfassen
    // — daher gezielt für diesen Ordner aus. Eigener Code bleibt streng geprüft.
    files: ['src/components/ui/**'],
    rules: {
      'react-hooks/purity': 'off',
    },
  },
]

export default eslintConfig
