import { createClient, Errors } from "@farcaster/quick-auth";
import { NextRequest, NextResponse } from "next/server";

const client = createClient();
const allowDemo = process.env.ALLOW_DEMO === "true";

type VerifiedUser =
  | { fid: number; error?: undefined }
  | { error: NextResponse };

function expectedDomain(req: NextRequest): string {
  if (process.env.QUICK_AUTH_DOMAIN) {
    return process.env.QUICK_AUTH_DOMAIN;
  }

  try {
    return req.nextUrl.hostname;
  } catch {
    return "localhost";
  }
}

export async function verifyRequest(req: NextRequest): Promise<VerifiedUser> {
  const authorization = req.headers.get("authorization");

  if (!authorization || !authorization.startsWith("Bearer ")) {
    if (allowDemo) {
      return { fid: 0 };
    }

    return {
      error: NextResponse.json(
        { error: "unauthorized", message: "Missing Authorization header" },
        { status: 401 }
      ),
    };
  }

  const token = authorization.split(" ")[1]!;

  try {
    const payload = await client.verifyJwt({
      token,
      domain: expectedDomain(req),
    });

    return { fid: payload.sub };
  } catch (error) {
    const message =
      error instanceof Errors.InvalidTokenError
        ? "Invalid or expired token"
        : "Unable to verify token";

    return {
      error: NextResponse.json(
        { error: "unauthorized", message },
        { status: 401 }
      ),
    };
  }
}
