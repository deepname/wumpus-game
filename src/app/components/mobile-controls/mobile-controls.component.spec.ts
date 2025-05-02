import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MobileControlsComponent } from './mobile-controls.component';
import { By } from '@angular/platform-browser';

describe('MobileControlsComponent', () => {
  let component: MobileControlsComponent;
  let fixture: ComponentFixture<MobileControlsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MobileControlsComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MobileControlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit move event with correct direction', () => {
    spyOn(component.move, 'emit');
    const buttons = fixture.debugElement.queryAll(By.css('button'));
    // ⬆️ is first, ⬅️ is second, ➡️ is fourth, ⬇️ is last
    buttons[0].nativeElement.click(); // up
    expect(component.move.emit).toHaveBeenCalledWith('up');
    buttons[1].nativeElement.click(); // left
    expect(component.move.emit).toHaveBeenCalledWith('left');
    buttons[3].nativeElement.click(); // right
    expect(component.move.emit).toHaveBeenCalledWith('right');
    buttons[4].nativeElement.click(); // down
    expect(component.move.emit).toHaveBeenCalledWith('down');
  });

  it('should emit shoot event when shoot button is clicked', () => {
    spyOn(component.shoot, 'emit');
    const buttons = fixture.debugElement.queryAll(By.css('button'));
    // The shoot button is the third button
    buttons[2].nativeElement.click();
    expect(component.shoot.emit).toHaveBeenCalled();
  });
});
