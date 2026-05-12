import { prisma } from "../../prisma/client";

type CategoryCreateData = {
  name: string;
  description?: string;
};

type CategoryUpdateData = {
  name?: string;
  description?: string | null;
};

export const CategoryRepository = {
  async create(data: CategoryCreateData) {
    return prisma.category.create({
      data: {
        name: data.name,
        description: data.description ?? null,
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });
  },

  async findAll() {
    return prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });
  },

  async findById(id: string) {
    return prisma.category.findUnique({
      where: { id },
    });
  },

  async findByNameInsensitive(name: string, excludeId?: string) {
    return prisma.category.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive",
        },
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
  },

  async update(id: string, data: CategoryUpdateData) {
    return prisma.category.update({
      where: { id },
      data,
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });
  },

  async delete(id: string) {
    return prisma.category.delete({
      where: { id },
    });
  },

  async countProductsByCategoryId(categoryId: string): Promise<number> {
    return prisma.product.count({
      where: { categoryId },
    });
  },
};

export default CategoryRepository;
