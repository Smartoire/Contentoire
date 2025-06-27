# News Source Module Template

1. Copy `NewsSourceTemplate.ts` and rename it (e.g. `MyNewsSource.ts`).
2. Implement the `fetchNews`, `getSettings`, and `saveSettings` methods.
3. Export your class as default.
4. Place your file in this folder. The system will auto-register all sources here.

**Example:**
```typescript
import { INewsSource } from './NewsSourceTemplate';

export default class MyNewsSource implements INewsSource {
  // ...implement required methods...
}
```
