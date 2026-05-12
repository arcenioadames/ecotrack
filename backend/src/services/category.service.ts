import CategoryRepository from "../repositories/category.repository";
import type { CategoryDto } from "../types/category.types";
import type { CreateCategoryInput, UpdateCategoryInput } from "../validators/category.validator";

type CategoryErrorCode =
  | "CATEGORY_ALREADY_EXISTS"
  | "CATEGORY_NOT_FOUND"
  | "CATEGORY_HAS_PRODUCTS";

export class CategoryServiceError extends Error {
  public readonly code: CategoryErrorCode;

  constructor(code: CategoryErrorCode) {
    super(code);
    this.code = code;
  }
}

function mapCategory(category: {
  id: string;
  name: string;
  description: string | null;
  _count: {
    products: number;
  };
  createdAt: Date;
  updatedAt: Date;
}): CategoryDto {
  return {
    id: category.id,
    name: category.name,
    description: category.description,
    productCount: category._count.products,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
}

export class CategoryService {
  public static async create(input: CreateCategoryInput): Promise<CategoryDto> {
    const name = input.name.trim();
    const description = input.description?.trim();

    const existing = await CategoryRepository.findByNameInsensitive(name);
    if (existing) {
      throw new CategoryServiceError("CATEGORY_ALREADY_EXISTS");
    }

    const created = await CategoryRepository.create({
      name,
      description,
    });

    return mapCategory(created);
  }

  public static async list(): Promise<CategoryDto[]> {
    const categories = await CategoryRepository.findAll();
    return categories.map(mapCategory);
  }

  public static async update(id: string, input: UpdateCategoryInput): Promise<CategoryDto> {
    const current = await CategoryRepository.findById(id);
    if (!current) {
      throw new CategoryServiceError("CATEGORY_NOT_FOUND");
    }

    const updateData: { name?: string; description?: string | null } = {};

    if (typeof input.name === "string") {
      const normalizedName = input.name.trim();
      const duplicate = await CategoryRepository.findByNameInsensitive(normalizedName, id);
      if (duplicate) {
        throw new CategoryServiceError("CATEGORY_ALREADY_EXISTS");
      }
      updateData.name = normalizedName;
    }

    if (Object.prototype.hasOwnProperty.call(input, "description")) {
      updateData.description = input.description === null ? null : input.description?.trim() ?? null;
    }

    const updated = await CategoryRepository.update(id, updateData);
    return mapCategory(updated);
  }

  public static async delete(id: string): Promise<void> {
    const current = await CategoryRepository.findById(id);
    if (!current) {
      throw new CategoryServiceError("CATEGORY_NOT_FOUND");
    }

    const productsCount = await CategoryRepository.countProductsByCategoryId(id);
    if (productsCount > 0) {
      throw new CategoryServiceError("CATEGORY_HAS_PRODUCTS");
    }

    await CategoryRepository.delete(id);
  }
}

export default CategoryService;
