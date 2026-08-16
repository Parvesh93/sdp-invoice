import {
  SignJWT,
  jwtVerify,
} from "jose";

import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";

const secret =
  new TextEncoder().encode(
    process.env.SESSION_SECRET
  );

export type SessionPayload = {
  userId: number;

  email: string;

  name: string;

  role:
    | "ADMIN"
    | "STAFF";
};

/* =========================================================
   CREATE SESSION
========================================================= */

export async function createSession(
  payload: SessionPayload
) {
  const token =
    await new SignJWT({
      /*
       * We only really need userId for future
       * validation, but keeping these fields
       * is fine for compatibility.
       */
      userId:
        payload.userId,

      email:
        payload.email,

      name:
        payload.name,

      role:
        payload.role,
    })
      .setProtectedHeader({
        alg: "HS256",
      })
      .setIssuedAt()
      .setExpirationTime(
        "8h"
      )
      .sign(secret);

  const cookieStore =
    await cookies();

  cookieStore.set(
    "sdp_session",
    token,
    {
      httpOnly: true,

      secure:
        process.env
          .NODE_ENV ===
        "production",

      sameSite:
        "lax",

      path:
        "/",

      maxAge:
        60 * 60 * 8,
    }
  );
}

/* =========================================================
   GET SESSION
========================================================= */

export async function getSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore =
      await cookies();

    const token =
      cookieStore.get(
        "sdp_session"
      )?.value;

    if (!token) {
      return null;
    }

    /* -----------------------------------------
       VERIFY JWT
    ----------------------------------------- */

    const { payload } =
      await jwtVerify(
        token,
        secret
      );

    const userId =
      Number(
        payload.userId
      );

    if (
      !Number.isInteger(
        userId
      ) ||
      userId <= 0
    ) {
      return null;
    }

    /* -----------------------------------------
       VERIFY CURRENT DATABASE USER
    ----------------------------------------- */

    const user =
      await prisma.user.findUnique({
        where: {
          id:
            userId,
        },

        select: {
          id: true,

          email: true,

          name: true,

          role: true,

          isActive:
            true,
        },
      });

    /*
     * User may have been deleted after the
     * session was created.
     */
    if (!user) {
      return null;
    }

    /*
     * Admin may have deactivated the account.
     *
     * Existing JWT must no longer grant access.
     */
    if (
      !user.isActive
    ) {
      return null;
    }

    /*
     * IMPORTANT:
     *
     * Return CURRENT database values,
     * not the stale values stored in JWT.
     *
     * If Admin changes:
     *
     * - Name
     * - Email
     * - Role
     *
     * the next request immediately sees the
     * latest information.
     */
    return {
      userId:
        user.id,

      email:
        user.email,

      name:
        user.name,

      role:
        user.role,
    };
  } catch (error) {
    /*
     * Invalid / expired / malformed JWT.
     */
    return null;
  }
}

/* =========================================================
   DELETE SESSION
========================================================= */

export async function deleteSession() {
  const cookieStore =
    await cookies();

  cookieStore.delete(
    "sdp_session"
  );
}