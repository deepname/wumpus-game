import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'range',
  standalone: true
})
export class RangePipe implements PipeTransform {
  transform(value: number): number[] {
    return Array(value).fill(0).map((_, i) => i);
  }
}
