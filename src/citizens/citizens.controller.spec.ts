import { Test, TestingModule } from '@nestjs/testing';
import { CitizensController } from './citizens.controller';
import { CitizensService } from './citizens.service';
import { CitizenWithLocationDto } from './dto/citizen.dto';

describe('CitizensController', () => {
  let controller: CitizensController;
  let service: CitizensService;

  const mockCitizenWithLocation: CitizenWithLocationDto = {
    id: 'citizen-1',
    nationalId: '12345678901234567890',
    firstName: 'John',
    lastName: 'Doe',
    phoneNumber: '+250788123456',
    isLeader: false,
    homeLocation: {
      id: 'village-1',
      name: 'Kigali Village',
      level: 5,
      parent: {
        id: 'cell-1',
        name: 'Kigali Cell',
        level: 4,
        parent: {
          id: 'sector-1',
          name: 'Kigali Sector',
          level: 3,
          parent: {
            id: 'district-1',
            name: 'Gasabo District',
            level: 2,
            parent: {
              id: 'province-1',
              name: 'Kigali City',
              level: 1,
              parent: null,
            },
          },
        },
      },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CitizensController],
      providers: [
        {
          provide: CitizensService,
          useValue: {
            getMe: jest.fn().mockResolvedValue(mockCitizenWithLocation),
          },
        },
      ],
    }).compile();

    controller = module.get<CitizensController>(CitizensController);
    service = module.get<CitizensService>(CitizensService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMe', () => {
    it('should return citizen profile with full location hierarchy', async () => {
      const mockRequest = {
        user: { sub: 'citizen-1' },
      } as any;

      const result = await controller.getMe(mockRequest);

      expect(result).toEqual(mockCitizenWithLocation);
      expect(service.getMe).toHaveBeenCalledWith('citizen-1');
    });

    it('should include full location chain from village to province', async () => {
      const mockRequest = {
        user: { sub: 'citizen-1' },
      } as any;

      const result = await controller.getMe(mockRequest);

      // Verify location hierarchy
      expect(result.homeLocation).toBeDefined();
      expect(result.homeLocation?.level).toBe(5); // Village
      expect(result.homeLocation?.parent?.level).toBe(4); // Cell
      expect(result.homeLocation?.parent?.parent?.level).toBe(3); // Sector
      expect(result.homeLocation?.parent?.parent?.parent?.level).toBe(2); // District
      expect(result.homeLocation?.parent?.parent?.parent?.parent?.level).toBe(1); // Province
      expect(result.homeLocation?.parent?.parent?.parent?.parent?.parent).toBeNull();
    });

    it('should extract citizenId from JWT token in request', async () => {
      const mockRequest = {
        user: { sub: 'citizen-123' },
      } as any;

      await controller.getMe(mockRequest);

      expect(service.getMe).toHaveBeenCalledWith('citizen-123');
    });
  });
});
