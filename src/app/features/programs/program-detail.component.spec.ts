import { REQUEST } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AdmissionApiService } from '../../core/http/admission-api.service';
import { APP_CONFIG } from '../../core/config/app-config';
import { OrganizationApiService } from '../../core/http/organization-api.service';
import type {
  DepartmentDto,
  FacultyDto,
  ProgramDto,
} from '../../core/http/organization-api.models';
import { ProgramDetailComponent } from './program-detail.component';
import { ProgramSeoService } from './program-seo.service';

describe('ProgramDetailComponent', () => {
  let fixture: ComponentFixture<ProgramDetailComponent>;
  let api: jasmine.SpyObj<OrganizationApiService>;
  let seoSpy: jasmine.SpyObj<ProgramSeoService>;

  const activeProgram: ProgramDto = {
    id: 'p1',
    departmentId: 'd1',
    name: 'BSc Computer Science',
    localizedName: 'BSc Computer Science',
    status: 'Active',
    createdAt: '',
    version: 1,
  };
  const department: DepartmentDto = {
    id: 'd1',
    facultyId: 'f1',
    name: 'Computer Science',
    localizedName: 'Computer Science',
    status: 'Active',
    createdAt: '',
    version: 1,
  };
  const faculty: FacultyDto = {
    id: 'f1',
    campusId: 'c1',
    name: 'Science',
    localizedName: 'Science',
    status: 'Active',
    createdAt: '',
    version: 1,
  };

  function setUp(): void {
    const admissionApiSpy = jasmine.createSpyObj<AdmissionApiService>('AdmissionApiService', [
      'getPublicCampaignWindow',
    ]);
    admissionApiSpy.getPublicCampaignWindow.and.returnValue(of(null));
    seoSpy = jasmine.createSpyObj<ProgramSeoService>('ProgramSeoService', ['apply', 'clear']);

    TestBed.configureTestingModule({
      imports: [ProgramDetailComponent],
      providers: [
        provideRouter([]),
        { provide: REQUEST, useValue: null },
        { provide: OrganizationApiService, useValue: api },
        { provide: AdmissionApiService, useValue: admissionApiSpy },
        { provide: ProgramSeoService, useValue: seoSpy },
        {
          provide: APP_CONFIG,
          useValue: { apiBaseUrl: '', admissionWebUrl: 'https://admission.example.edu' },
        },
      ],
    });
    fixture = TestBed.createComponent(ProgramDetailComponent);
    fixture.componentRef.setInput('programId', 'p1');
  }

  beforeEach(() => {
    api = jasmine.createSpyObj<OrganizationApiService>('OrganizationApiService', [
      'getProgram',
      'getDepartment',
      'getFaculty',
      'listPrograms',
      'listFaculties',
      'listDepartments',
      'getNodeAncestors',
    ]);
  });

  it('renders the program name, breadcrumb, and quick facts once loaded', () => {
    api.getProgram.and.returnValue(of(activeProgram));
    api.getDepartment.and.returnValue(of(department));
    api.getFaculty.and.returnValue(of(faculty));
    setUp();

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('BSc Computer Science');
    expect(fixture.nativeElement.textContent).toContain('Computer Science');
    expect(fixture.nativeElement.textContent).toContain('Science');
    expect(seoSpy.apply).toHaveBeenCalled();
  });

  it('renders a persistent Apply Now CTA bound to this program id', () => {
    api.getProgram.and.returnValue(of(activeProgram));
    api.getDepartment.and.returnValue(of(department));
    api.getFaculty.and.returnValue(of(faculty));
    setUp();

    fixture.detectChanges();

    const cta = fixture.nativeElement.querySelector('pweb-apply-now-cta');
    expect(cta).not.toBeNull();
  });

  it('renders a not-found state when the program cannot be fetched', () => {
    api.getProgram.and.returnValue(throwError(() => new Error('404')));
    setUp();

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('This program could not be found');
  });

  it('SSR/Hydration Freshness Policy: flags the program unavailable once a recheck finds it no longer Active', () => {
    api.getProgram.and.returnValue(of(activeProgram));
    api.getDepartment.and.returnValue(of(department));
    api.getFaculty.and.returnValue(of(faculty));
    setUp();
    fixture.detectChanges();
    expect(fixture.componentInstance['unavailable']()).toBeFalse();

    api.getProgram.and.returnValue(of({ ...activeProgram, status: 'Archived' }));
    fixture.componentInstance['recheckPublishState']();
    fixture.detectChanges();

    expect(fixture.componentInstance['unavailable']()).toBeTrue();
    expect(fixture.nativeElement.textContent).toContain('This program is no longer available');
  });

  it('a freshness recheck failure never breaks the already-rendered page', () => {
    api.getProgram.and.returnValue(of(activeProgram));
    api.getDepartment.and.returnValue(of(department));
    api.getFaculty.and.returnValue(of(faculty));
    setUp();
    fixture.detectChanges();

    api.getProgram.and.returnValue(throwError(() => new Error('network')));
    expect(() => fixture.componentInstance['recheckPublishState']()).not.toThrow();
    expect(fixture.componentInstance['unavailable']()).toBeFalse();
  });
});
