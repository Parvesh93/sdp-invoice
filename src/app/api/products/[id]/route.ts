import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    const productId = Number(id);

    if (!Number.isInteger(productId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid product ID.",
        },
        {
          status: 400,
        }
      );
    }

    const product =
      await prisma.product.findUnique({
        where: {
          id: productId,
        },

        include: {
          category: true,

          variants: {
            orderBy: {
              id: "asc",
            },
          },
        },
      });

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("GET PRODUCT ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to fetch product.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    const productId = Number(id);

    if (!Number.isInteger(productId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid product ID.",
        },
        {
          status: 400,
        }
      );
    }

    const existing =
      await prisma.product.findUnique({
        where: {
          id: productId,
        },
      });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found.",
        },
        {
          status: 404,
        }
      );
    }

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

    const variants = Array.isArray(
      body.variants
    )
      ? body.variants
          .map((variant: unknown) =>
            String(variant ?? "").trim()
          )
          .filter(Boolean)
      : [];

    const updated =
      await prisma.$transaction(
        async (tx) => {
          /*
           * Since variants are simple strings for
           * now, replace existing variants with the
           * submitted list.
           *
           * We do NOT delete variants already used
           * in DocumentItem because of FK history.
           */
          const existingVariants =
            await tx.productVariant.findMany({
              where: {
                productId,
              },

              include: {
                _count: {
                  select: {
                    documentItems: true,
                  },
                },
              },
            });

          for (const variant of existingVariants) {
            if (
              variant._count.documentItems === 0
            ) {
              await tx.productVariant.delete({
                where: {
                  id: variant.id,
                },
              });
            } else {
              await tx.productVariant.update({
                where: {
                  id: variant.id,
                },

                data: {
                  isActive: false,
                },
              });
            }
          }

          const product =
            await tx.product.update({
              where: {
                id: productId,
              },

              data: {
                name,

                model:
                  model || null,

                description:
                  description || null,

                annexureContent:
                  annexureContent || null,

                categoryId,

                standardPrice,

                isActive:
                  body.isActive !== false,
              },
            });

          if (variants.length > 0) {
            await tx.productVariant.createMany({
              data: variants.map(
                (variant: string) => ({
                  productId,
                  name: variant,
                  isActive: true,
                })
              ),
            });
          }

          return product;
        }
      );

    return NextResponse.json({
      success: true,
      message:
        "Product updated successfully.",
      data: updated,
    });
  } catch (error) {
    console.error(
      "UPDATE PRODUCT ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to update product.",
      },
      {
        status: 500,
      }
    );
  }
}