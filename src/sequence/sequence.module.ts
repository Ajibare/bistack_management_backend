import { Global, Module } from '@nestjs/common';
import { SequenceService } from './sequence.service';

/**
 * Global module so any feature module can inject `SequenceService` without
 * having to import this module explicitly. We mark it `@Global()` because
 * auto-incrementing SNs are a cross-cutting concern used by nearly every
 * resource in the app.
 */
@Global()
@Module({
  providers: [SequenceService],
  exports: [SequenceService],
})
export class SequenceModule {}
