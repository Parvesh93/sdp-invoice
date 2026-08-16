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

    const categoryId = Number(id);

    if (!Number.isInteger(categoryId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid category ID.",
        },
        {
          status: 400,
        }
      );
    }

    const category = await prisma.category.findUnique({
      where: {
        id: categoryId,
      },
    });

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message: "Category not found.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error("GET CATEGORY ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to fetch category.",
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

    const categoryId = Number(id);

    if (!Number.isInteger(categoryId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid category ID.",
        },
        {
          status: 400,
        }
      );
    }

    const body = await request.json();

    const name = String(body.name ?? "").trim();
    const description = String(body.description ?? "").trim();

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message: "Category name is required.",
        },
        {
          status: 422,
        }
      );
    }

    const category = await prisma.category.findUnique({
      where: {
        id: categoryId,
      },
    });

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message: "Category not found.",
        },
        {
          status: 404,
        }
      );
    }

    const duplicateCategory = await prisma.category.findFirst({
      where: {
        name,
        NOT: {
          id: categoryId,
        },
      },
    });

    if (duplicateCategory) {
      return NextResponse.json(
        {
          success: false,
          message: "Another category already uses this name.",
        },
        {
          status: 409,
        }
      );
    }

    const updatedCategory = await prisma.category.update({
      where: {
        id: categoryId,
      },
      data: {
        name,
        description: description || null,
        isActive: body.isActive ?? category.isActive,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Category updated successfully.",
      data: updatedCategory,
    });
  } catch (error) {
    console.error("UPDATE CATEGORY ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update category.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    const categoryId = Number(id);

    if (!Number.isInteger(categoryId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid category ID.",
        },
        {
          status: 400,
        }
      );
    }

    const category = await prisma.category.findUnique({
      where: {
        id: categoryId,
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message: "Category not found.",
        },
        {
          status: 404,
        }
      );
    }

    if (category._count.products > 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This category contains products and cannot be deleted.",
        },
        {
          status: 409,
        }
      );
    }

    await prisma.category.delete({
      where: {
        id: categoryId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE CATEGORY ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to delete category.",
      },
      {
        status: 500,
      }
    );
  }
}