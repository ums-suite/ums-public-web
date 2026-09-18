import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import type { ProgramDto } from '../../core/http/organization-api.models';
import { ProgramSeoService } from './program-seo.service';

describe('ProgramSeoService', () => {
  const program: ProgramDto = {
    id: 'p1',
    departmentId: 'd1',
    name: 'BSc Computer Science',
    localizedName: 'BSc Computer Science',
    status: 'Active',
    createdAt: '',
    version: 1,
  };

  afterEach(() => {
    TestBed.inject(ProgramSeoService).clear();
  });

  it('sets the document title from the program name', () => {
    const service = TestBed.inject(ProgramSeoService);
    service.apply(program, 'https://ums.example.edu/programs/p1', 'UMS University');

    expect(TestBed.inject(Title).getTitle()).toBe('BSc Computer Science | UMS');
  });

  it('injects a single EducationalOccupationalProgram JSON-LD script with only real fields', () => {
    const service = TestBed.inject(ProgramSeoService);
    service.apply(program, 'https://ums.example.edu/programs/p1', 'UMS University');

    const script = TestBed.inject(DOCUMENT).getElementById('pweb-program-jsonld');
    expect(script).not.toBeNull();
    const jsonLd = JSON.parse(script?.textContent ?? '{}');
    expect(jsonLd['@type']).toBe('EducationalOccupationalProgram');
    expect(jsonLd.name).toBe('BSc Computer Science');
    expect(jsonLd.provider).toEqual({ '@type': 'CollegeOrUniversity', name: 'UMS University' });
  });

  it('replaces (never duplicates) the script tag on a second apply call', () => {
    const service = TestBed.inject(ProgramSeoService);
    service.apply(program, 'https://ums.example.edu/programs/p1', 'UMS University');
    service.apply(program, 'https://ums.example.edu/programs/p1', 'UMS University');

    const doc = TestBed.inject(DOCUMENT);
    expect(doc.querySelectorAll('#pweb-program-jsonld').length).toBe(1);
  });

  it('clear() removes the script tag entirely', () => {
    const service = TestBed.inject(ProgramSeoService);
    service.apply(program, 'https://ums.example.edu/programs/p1', 'UMS University');

    service.clear();

    expect(TestBed.inject(DOCUMENT).getElementById('pweb-program-jsonld')).toBeNull();
  });
});
