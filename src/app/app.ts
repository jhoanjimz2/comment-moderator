import { Component } from '@angular/core';
import { Moderation } from './features/moderation/moderation';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [Moderation],
  template: '<app-moderation />'
})
export class App {}
