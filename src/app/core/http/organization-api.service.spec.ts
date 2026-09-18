import { HttpClient, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { APP_CONFIG } from '../config/app-config';
import { OrganizationApiService } from './organization-api.service';

describe('OrganizationApiService', () => {
  let service: OrganizationApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: APP_CONFIG,
          useValue: { apiBaseUrl: 'http://localhost:8080', admissionWebUrl: '' },
        },
      ],
    });
    TestBed.inject(HttpClient);
    service = TestBed.inject(OrganizationApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('lists programs filtered by department at the confirmed route', () => {
    service.listPrograms({ departmentId: 'dep-1', skip: 0, take: 20 }).subscribe();

    const req = httpMock.expectOne(
      (r) =>
        r.url === 'http://localhost:8080/api/v1/organization/programs' &&
        r.params.get('departmentId') === 'dep-1' &&
        r.params.get('skip') === '0' &&
        r.params.get('take') === '20',
    );
    expect(req.request.method).toBe('GET');
    req.flush({ items: [], totalCount: 0, skip: 0, take: 20 });
  });

  it('omits undefined optional params rather than sending the literal string "undefined"', () => {
    service.listPrograms({}).subscribe();

    const req = httpMock.expectOne('http://localhost:8080/api/v1/organization/programs');
    expect(req.request.params.has('departmentId')).toBeFalse();
    req.flush({ items: [], totalCount: 0, skip: 0, take: 0 });
  });

  it('fetches a single program by id', () => {
    service.getProgram('p1').subscribe();
    const req = httpMock.expectOne('http://localhost:8080/api/v1/organization/programs/p1');
    expect(req.request.method).toBe('GET');
    req.flush({ id: 'p1' });
  });

  it('fetches a node ancestor chain for breadcrumbs', () => {
    service.getNodeAncestors('p1').subscribe();
    const req = httpMock.expectOne('http://localhost:8080/api/v1/organization/nodes/p1/ancestors');
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 'u1', nodeType: 'University', name: 'UMS' }]);
  });
});
