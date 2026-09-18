import type { DownloadResourceDto } from '../../core/http/content-api.models';
import { groupDownloadsByCategory } from './downloads.models';

function download(id: string, category: string): DownloadResourceDto {
  return {
    id,
    title: `Download ${id}`,
    category,
    artifactId: 'artifact-1',
    status: 'Published',
    publishAt: null,
    expireAt: null,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    version: 1,
  };
}

describe('groupDownloadsByCategory', () => {
  it('groups items under their real category field', () => {
    const groups = groupDownloadsByCategory([
      download('d1', 'Forms'),
      download('d2', 'Brochures'),
      download('d3', 'Forms'),
    ]);

    expect(groups.length).toBe(2);
    const forms = groups.find((g) => g.category === 'Forms');
    expect(forms?.items.map((i) => i.id)).toEqual(['d1', 'd3']);
  });

  it('sorts groups alphabetically by category for a stable layout', () => {
    const groups = groupDownloadsByCategory([
      download('d1', 'Regulations'),
      download('d2', 'Brochures'),
    ]);
    expect(groups.map((g) => g.category)).toEqual(['Brochures', 'Regulations']);
  });

  it('returns an empty array for no items, never a group with an empty item list', () => {
    expect(groupDownloadsByCategory([])).toEqual([]);
  });
});
