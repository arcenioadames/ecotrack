import CategoryRepository from "../repositories/category.repository";
import ProductRepository from "../repositories/product.repository";
import type { ProductDto, ProductFilters, ProductListResponseDto } from "../types/product.types";
import { getInventoryStatus, isExpirationDateInPast } from "../utils/inventory-status.util";
import type { CreateProductInput, ListProductsQueryInput, UpdateProductInput } from "../validators/product.validator";

type ProductServiceErrorCode =
  | "PRODUCT_NOT_FOUND"
  | "PRODUCT_BARCODE_ALREADY_EXISTS"
  | "CATEGORY_NOT_FOUND"
  | "INVALID_EXPIRATION_DATE"
  | "INVALID_DATE_RANGE";

export class ProductServiceError extends Error {
  public readonly code: ProductServiceErrorCode;

  constructor(code: ProductServiceErrorCode) {
    super(code);
    this.code = code;
  }
}

function mapProduct(product: {
  id: string;
  name: string;
  barcode: string;
  expirationDate: Date;
  categoryId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  category: {
    id: string;
    name: string;
    description: string | null;
  };
}): ProductDto {
  return {
    id: product.id,
    name: product.name,
    barcode: product.barcode,
    expirationDate: product.expirationDate,
    category: {
      id: product.category.id,
      name: product.category.name,
      description: product.category.description,
    },
    createdBy: product.createdBy,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    status: getInventoryStatus(product.expirationDate, 3),
  };
}

function parseFilters(input: ListProductsQueryInput): ProductFilters {
  if (input.expirationFrom && input.expirationTo && input.expirationFrom > input.expirationTo) {
    throw new ProductServiceError("INVALID_DATE_RANGE");
  }

  return {
    page: input.page,
    limit: input.limit,
    search: input.search,
    categoryId: input.categoryId,
    expirationFrom: input.expirationFrom,
    expirationTo: input.expirationTo,
  };
}

export class ProductService {
  public static async create(input: CreateProductInput, createdBy: string): Promise<ProductDto> {
    if (isExpirationDateInPast(input.expirationDate)) {
      throw new ProductServiceError("INVALID_EXPIRATION_DATE");
    }

    const category = await CategoryRepository.findById(input.categoryId);
    if (!category) {
      throw new ProductServiceError("CATEGORY_NOT_FOUND");
    }

    const duplicateBarcode = await ProductRepository.findByBarcode(input.barcode.trim());
    if (duplicateBarcode) {
      throw new ProductServiceError("PRODUCT_BARCODE_ALREADY_EXISTS");
    }

    const created = await ProductRepository.create({
      name: input.name.trim(),
      barcode: input.barcode.trim(),
      expirationDate: input.expirationDate,
      categoryId: input.categoryId,
      createdBy,
    });

    return mapProduct(created);
  }

  public static async list(input: ListProductsQueryInput): Promise<ProductListResponseDto> {
    const filters = parseFilters(input);
    const result = await ProductRepository.findManyWithFilters(filters);

    return {
      items: result.items.map(mapProduct),
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total: result.total,
        totalPages: Math.max(1, Math.ceil(result.total / filters.limit)),
      },
    };
  }

  public static async getById(id: string): Promise<ProductDto> {
    const product = await ProductRepository.findById(id);
    if (!product) {
      throw new ProductServiceError("PRODUCT_NOT_FOUND");
    }

    return mapProduct(product);
  }

  public static async update(id: string, input: UpdateProductInput): Promise<ProductDto> {
    const current = await ProductRepository.findById(id);
    if (!current) {
      throw new ProductServiceError("PRODUCT_NOT_FOUND");
    }

    if (input.expirationDate && isExpirationDateInPast(input.expirationDate)) {
      throw new ProductServiceError("INVALID_EXPIRATION_DATE");
    }

    if (input.categoryId) {
      const category = await CategoryRepository.findById(input.categoryId);
      if (!category) {
        throw new ProductServiceError("CATEGORY_NOT_FOUND");
      }
    }

    if (input.barcode) {
      const duplicateBarcode = await ProductRepository.findByBarcode(input.barcode.trim(), id);
      if (duplicateBarcode) {
        throw new ProductServiceError("PRODUCT_BARCODE_ALREADY_EXISTS");
      }
    }

    const updated = await ProductRepository.update(id, {
      ...(input.name ? { name: input.name.trim() } : {}),
      ...(input.barcode ? { barcode: input.barcode.trim() } : {}),
      ...(input.expirationDate ? { expirationDate: input.expirationDate } : {}),
      ...(input.categoryId ? { categoryId: input.categoryId } : {}),
    });

    return mapProduct(updated);
  }

  public static async delete(id: string): Promise<void> {
    const current = await ProductRepository.findById(id);
    if (!current) {
      throw new ProductServiceError("PRODUCT_NOT_FOUND");
    }

    await ProductRepository.delete(id);
  }

  public static async listExpiring(days: number): Promise<ProductDto[]> {
    const items = await ProductRepository.findExpiring(days, new Date());
    return items.map((item: { expirationDate: Date } & Parameters<typeof mapProduct>[0]) => ({

      ...mapProduct(item),
      status: getInventoryStatus(item.expirationDate, days),
    }));
  }
}

export default ProductService;
