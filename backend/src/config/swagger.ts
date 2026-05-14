import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "EcoTrack Backend API",
      version: "1.0.0",
      description: "API documentation for EcoTrack authentication system",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        RegisterRequest: {
          type: "object",
          required: ["name", "email", "password", "role", "acceptedPolicy"],
          properties: {
            name: {
              type: "string",
              example: "Juan Pérez",
              description: "User full name (min 3 characters)",
            },
            email: {
              type: "string",
              format: "email",
              example: "juan@example.com",
            },
            password: {
              type: "string",
              example: "SecurePass123",
              description: "Min 8 chars, 1 uppercase, 1 number",
            },
            role: {
              type: "string",
              enum: ["ADMIN", "STAFF"],
              example: "STAFF",
              description: "Allowed role values",
            },
            acceptedPolicy: {
              type: "boolean",
              example: true,
              description: "Must be true to register",
            },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "juan@example.com",
            },
            password: {
              type: "string",
              example: "SecurePass123",
            },
          },
        },
        RefreshTokenRequest: {
          type: "object",
          required: ["refreshToken"],
          properties: {
            refreshToken: {
              type: "string",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            },
          },
        },
        UserResponse: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
            },
            name: {
              type: "string",
            },
            email: {
              type: "string",
              format: "email",
            },
            role: {
              type: "string",
              enum: ["ADMIN", "STAFF"],
            },
            acceptedPolicy: {
              type: "boolean",
            },
            policyAcceptedAt: {
              type: "string",
              format: "date-time",
              nullable: true,
            },
            policyVersion: {
              type: "string",
              nullable: true,
            },
            anonymizedAt: {
              type: "string",
              format: "date-time",
              nullable: true,
            },
            anonymizedReason: {
              type: "string",
              nullable: true,
            },
            isActive: {
              type: "boolean",
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
        AuthTokensResponse: {
          type: "object",
          properties: {
            accessToken: {
              type: "string",
              description: "JWT access token (1 hour validity)",
            },
            refreshToken: {
              type: "string",
              description: "JWT refresh token (7 days validity)",
            },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            message: {
              type: "string",
            },
            errors: {
              type: "array",
              items: {
                type: "object",
              },
            },
          },
        },
        AnonymizeMeRequest: {
          type: "object",
          required: ["confirmAnonymization"],
          properties: {
            confirmAnonymization: {
              type: "boolean",
              enum: [true],
              example: true,
            },
            reason: {
              type: "string",
              example: "Ejercicio del derecho al olvido",
              maxLength: 255,
            },
          },
        },
        AnonymizeMeResponse: {
          type: "object",
          properties: {
            message: {
              type: "string",
            },
            user: {
              $ref: "#/components/schemas/UserResponse",
            },
          },
        },
        CreateCategoryRequest: {
          type: "object",
          required: ["name"],
          properties: {
            name: {
              type: "string",
              minLength: 3,
              example: "Lácteos",
            },
            description: {
              type: "string",
              nullable: true,
              example: "Productos refrigerados",
            },
          },
        },
        UpdateCategoryRequest: {
          type: "object",
          properties: {
            name: {
              type: "string",
              minLength: 3,
              example: "Panadería",
            },
            description: {
              type: "string",
              nullable: true,
              example: "Productos secos",
            },
          },
        },
        CategoryResponse: {
          type: "object",
          properties: {
            id: {
              type: "string",
            },
            name: {
              type: "string",
            },
            description: {
              type: "string",
              nullable: true,
            },
            productCount: {
              type: "number",
              example: 12,
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
        CreateProductRequest: {
          type: "object",
          required: ["name", "barcode", "expirationDate", "categoryId"],
          properties: {
            name: {
              type: "string",
              example: "Leche Entera 1L",
            },
            barcode: {
              type: "string",
              example: "7701234567890",
            },
            expirationDate: {
              type: "string",
              format: "date-time",
              example: "2026-06-30T00:00:00.000Z",
            },
            categoryId: {
              type: "string",
              example: "cat_123",
            },
          },
        },
        UpdateProductRequest: {
          type: "object",
          properties: {
            name: {
              type: "string",
            },
            barcode: {
              type: "string",
            },
            expirationDate: {
              type: "string",
              format: "date-time",
            },
            categoryId: {
              type: "string",
            },
          },
        },
        ProductResponse: {
          type: "object",
          properties: {
            id: {
              type: "string",
            },
            name: {
              type: "string",
            },
            barcode: {
              type: "string",
            },
            expirationDate: {
              type: "string",
              format: "date-time",
            },
            category: {
              type: "object",
              properties: {
                id: { type: "string" },
                name: { type: "string" },
                description: { type: "string", nullable: true },
              },
            },
            createdBy: {
              type: "string",
            },
            status: {
              type: "string",
              enum: ["OK", "EXPIRING", "EXPIRED"],
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
        AnalyticsDashboardResponse: {
          type: "object",
          properties: {
            totalProducts: { type: "number" },
            expiringProducts: { type: "number" },
            expiredProducts: { type: "number" },
            productsByCategory: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  categoryId: { type: "string" },
                  categoryName: { type: "string" },
                  count: { type: "number" },
                },
              },
            },
            inventoryStatusDistribution: {
              type: "object",
              properties: {
                ok: { type: "number" },
                expiring: { type: "number" },
                expired: { type: "number" },
              },
            },
          },
        },
        ExportProductsRequest: {
          type: "object",
          properties: {
            format: {
              type: "string",
              enum: ["pdf", "excel"],
              example: "pdf",
            },
            search: {
              type: "string",
              example: "leche",
            },
            categoryId: {
              type: "string",
              example: "cat_123",
            },
            expirationFrom: {
              type: "string",
              format: "date-time",
            },
            expirationTo: {
              type: "string",
              format: "date-time",
            },
            status: {
              type: "string",
              enum: ["expired", "all"],
              example: "expired",
            },
          },
        },
        ExportPendingResponse: {
          type: "object",
          properties: {
            message: {
              type: "string",
              example: "HU-14 export feature pending implementation",
            },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
