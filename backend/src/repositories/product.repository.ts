import { prisma } from "../../prisma/client";

import type { ProductFilters } from "../types/product.types";

type ProductCreateData = {
  name: string;
  barcode: string;
  expirationDate: Date;
  categoryId: string;
  createdBy: string;
};

type ProductUpdateData = {
  name?: string;
  barcode?: string;
  expirationDate?: Date;
  categoryId?: string;
};

type ProductExportQueryInput = {
  search?: string;
  categoryId?: string;
  expirationFrom?: Date;
  expirationTo?: Date;
  status?: "expired" | "all";
};

function toUtcStartOfDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function buildProductWhere(filters: ProductExportQueryInput, referenceDate = new Date()) {
  const referenceDay = toUtcStartOfDay(referenceDate);
  const where: {
    OR?: Array<{
      name?: { contains: string; mode: "insensitive" };
      barcode?: { contains: string; mode: "insensitive" };
    }>;
    categoryId?: string;
    expirationDate?: {
      gte?: Date;
      lte?: Date;
      lt?: Date;
    };
  } = {};

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { barcode: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  if (filters.categoryId) {
    where.categoryId = filters.categoryId;
  }

  if (filters.expirationFrom || filters.expirationTo) {
    where.expirationDate = {
      ...(filters.expirationFrom ? { gte: filters.expirationFrom } : {}),
      ...(filters.expirationTo ? { lte: filters.expirationTo } : {}),
    };
  }

  if (filters.status === "expired") {
    where.expirationDate = {
      ...(where.expirationDate ?? {}),
      lt: referenceDay,
    };
  }

  return where;
}

export const ProductRepository = {
  async create(data: ProductCreateData) {
    return prisma.product.create({
      data,
      include: {
        category: true,
      },
    });
  },

  async findById(id: string) {
    return prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });
  },

  async findByBarcode(barcode: string, excludeId?: string) {
    return prisma.product.findFirst({
      where: {
        barcode: {
          equals: barcode,
          mode: "insensitive",
        },
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
  },

  async update(id: string, data: ProductUpdateData) {
    return prisma.product.update({
      where: { id },
      data,
      include: {
        category: true,
      },
    });
  },

  async delete(id: string) {
    return prisma.product.delete({
      where: { id },
    });
  },

  async findManyWithFilters(filters: ProductFilters) {
    const where = buildProductWhere(filters);

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
        },
        orderBy: { expirationDate: "asc" },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      prisma.product.count({ where }),
    ]);

    return { items, total };
  },

  async findExpiring(days: number, referenceDate: Date) {
    const threshold = new Date(referenceDate.getTime() + days * 24 * 60 * 60 * 1000);

    return prisma.product.findMany({
      where: {
        expirationDate: {
          lte: threshold,
        },
      },
      include: {
        category: true,
      },
      orderBy: { expirationDate: "asc" },
    });
  },

  async countAll() {
    return prisma.product.count();
  },

  async countExpired(referenceDate: Date) {
    return prisma.product.count({
      where: {
        expirationDate: {
          lt: referenceDate,
        },
      },
    });
  },

  async countExpiring(referenceDate: Date, days: number) {
    const threshold = new Date(referenceDate.getTime() + days * 24 * 60 * 60 * 1000);

    return prisma.product.count({
      where: {
        expirationDate: {
          gte: referenceDate,
          lte: threshold,
        },
      },
    });
  },

  async countByCategory() {
    const rows = await prisma.product.groupBy({
      by: ["categoryId"],
      _count: {
        _all: true,
      },
    });

    const categoryIds = rows.map((row) => row.categoryId);
    const categories = categoryIds.length
      ? await prisma.category.findMany({
          where: {
            id: {
              in: categoryIds,
            },
          },
          select: {
            id: true,
            name: true,
          },
        })
      : [];

    const categoryNameById = new Map(categories.map((category) => [category.id, category.name]));

    return rows.map((row) => ({
      categoryId: row.categoryId,
      categoryName: categoryNameById.get(row.categoryId) ?? "Sin categoría",
      count: row._count._all,
    }));
  },

  buildExportableWhere(filters: ProductExportQueryInput) {
    return buildProductWhere(filters);
  },

  async findExportable(filters: ProductExportQueryInput) {
    return prisma.product.findMany({
      where: buildProductWhere(filters),
      include: {
        category: true,
      },
      orderBy: { expirationDate: "asc" },
    });
  },
};

export default ProductRepository;
