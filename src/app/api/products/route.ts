import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,

        variants: {
          orderBy: {
            id: "asc",
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to fetch products.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const name = String(body.name ?? "").trim();
    const model = String(body.model ?? "").trim();
    const description = String(
      body.description ?? ""
    ).trim();

    const annexureContent = String(
      body.annexureContent ?? ""
    ).trim();

    const categoryId = Number(body.categoryId);
    const standardPrice = Number(
      body.standardPrice
    );

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message: "Product name is required.",
        },
        {
          status: 422,
        }
      );
    }

    if (!Number.isInteger(categoryId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Category is required.",
        },
        {
          status: 422,
        }
      );
    }

    if (
      !Number.isFinite(standardPrice) ||
      standardPrice < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A valid standard price is required.",
        },
        {
          status: 422,
        }
      );
    }

    const category =
      await prisma.category.findUnique({
        where: {
          id: categoryId,
        },
      });

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Selected category does not exist.",
        },
        {
          status: 404,
        }
      );
    }

    const variants = Array.isArray(
      body.variants
    )
      ? body.variants
          .map((variant: unknown) =>
            String(variant ?? "").trim()
          )
          .filter(Boolean)
      : [];

    const product =
      await prisma.product.create({
        data: {
          name,

          model: model || null,

          description:
            description || null,

          annexureContent:
            annexureContent || null,

          standardPrice,

          categoryId,

          isActive:
            body.isActive !== false,

          variants: {
            create: variants.map(
              (variant: string) => ({
                name: variant,
                isActive: true,
              })
            ),
          },
        },

        include: {
          category: true,
          variants: true,
        },
      });

    return NextResponse.json(
      {
        success: true,
        message:
          "Product created successfully.",
        data: product,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "CREATE PRODUCT ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to create product.",
      },
      {
        status: 500,
      }
    );
  }
}