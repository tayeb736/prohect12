import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.category.findMany({
      where: { isActive: true },
      include: { children: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: { children: true, products: { take: 10 } },
    });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async create(dto: CreateCategoryDto) {
    const existing = await this.prisma.category.findUnique({ where: { slug: dto.slug } });
    if (existing) throw new ConflictException('Category slug already exists');

    return this.prisma.category.create({ data: dto });
  }

  // Seed initial medical categories
  async seed() {
    const count = await this.prisma.category.count();
    if (count > 0) return { message: 'Categories already seeded' };

    const initialCategories = [
      { name: 'Radiology & Imaging', nameAr: 'الأشعة والتصوير الطبي', slug: 'radiology-imaging', icon: 'fas fa-x-ray' },
      { name: 'Surgical Instruments', nameAr: 'الأدوات الجراحية', slug: 'surgical-instruments', icon: 'fas fa-tools' },
      { name: 'Dental Equipment', nameAr: 'معدات طب الأسنان', slug: 'dental-equipment', icon: 'fas fa-tooth' },
      { name: 'Laboratory Gear', nameAr: 'معدات المختبرات', slug: 'laboratory-gear', icon: 'fas fa-flask' },
      { name: 'Patient Care & Monitoring', nameAr: 'عناية ومراقبة المرضى', slug: 'patient-care', icon: 'fas fa-heartbeat' },
      { name: 'Emergency & First Aid', nameAr: 'الطوارئ والإسعافات الأولية', slug: 'emergency-first-aid', icon: 'fas fa-ambulance' },
      { name: 'Hospital Furniture', nameAr: 'أثاث المستشفيات', slug: 'hospital-furniture', icon: 'fas fa-bed' },
      { name: 'Orthopedic Supplies', nameAr: 'مستلزمات تقويم العظام', slug: 'orthopedic-supplies', icon: 'fas fa-bone' },
    ];

    await this.prisma.category.createMany({
      data: initialCategories,
    });

    return { message: 'Successfully seeded 8 categories' };
  }
}
