import { MediaService } from './media.service';

jest.mock('fs/promises', () => ({
  mkdir: jest.fn().mockResolvedValue(undefined),
  writeFile: jest.fn().mockResolvedValue(undefined),
  unlink: jest.fn().mockResolvedValue(undefined),
}));

describe('MediaService', () => {
  const prismaMock = {
    media: {
      findMany: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    entryValue: {
      updateMany: jest.fn(),
    },
  };

  const service = new MediaService(prismaMock as never);

  beforeEach(() => {
    jest.clearAllMocks();
    prismaMock.media.create.mockImplementation(({ data }) => data);
  });

  it('saves uploads with sanitized file names for storage and db', async () => {
    const file = {
      originalname:
        'Çok ama çok uzun !!! saçma___dosya adı FINAL FINAL FINAL sürüm_2026_03_18.png',
      mimetype: 'image/png',
      size: 2048,
      buffer: Buffer.from('file-content'),
    };

    const result = await service.upload(file);
    const savedName = result.filename as string;

    expect(savedName.endsWith('.png')).toBe(true);
    expect(savedName).toMatch(/^[a-z0-9-]+-[A-Za-z0-9]{8}\.png$/);
    expect(savedName).not.toContain(' ');
    expect(savedName).not.toContain('_');
    expect(savedName.length).toBeLessThanOrEqual(80);
    expect(result.url).toBe(`/uploads/${savedName}`);
  });

  it('falls back to a safe default base name when original base is empty', async () => {
    const file = {
      originalname: '!!!.pdf',
      mimetype: 'application/pdf',
      size: 1024,
      buffer: Buffer.from('file-content'),
    };

    const result = await service.upload(file);

    expect(result.filename).toMatch(/^file-[A-Za-z0-9]{8}\.pdf$/);
    expect(result.url).toBe(`/uploads/${result.filename}`);
  });
});
