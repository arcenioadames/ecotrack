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
      },
    },
  },
  apis: ["./src/routes/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
