import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SobreturnoComponent } from './sobreturno.component';

describe('SobreturnoComponent', () => {
  let component: SobreturnoComponent;
  let fixture: ComponentFixture<SobreturnoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SobreturnoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SobreturnoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
